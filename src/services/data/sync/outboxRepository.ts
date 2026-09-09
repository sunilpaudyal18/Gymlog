/**
 * Outbox Repository - Phase 5 Architecture
 *
 * Manages durable persistence, transactional queueing, and safe operation
 * coalescing for local-first sync operations in IndexedDB (STORES.SYNC_OUTBOX).
 */

import { withStore, withStores, STORES } from '../../database/db';
import {
  SyncOperation,
  SyncEntityType,
  SyncOperationType,
  SyncOperationStatus,
  OutboxStats,
  SyncMetadata,
} from './syncTypes';

export const SYNC_METADATA_KEY = 'sync_metadata';

/**
 * Generates a collision-safe UUID v4 for operations.
 */
export function generateOperationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface QueueOperationParams<T = unknown> {
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperationType;
  payload?: T;
  idempotencyKey?: string;
}

export const outboxRepository = {
  /**
   * Enqueues a sync operation transactionally inside an already open IDBObjectStore.
   * Performs safe operation coalescing without breaking semantic meaning.
   */
  queueOperationInTx(
    outboxStore: IDBObjectStore,
    params: QueueOperationParams,
    metaStore?: IDBObjectStore
  ): Promise<SyncOperation> {
    return new Promise<SyncOperation>((resolve, reject) => {
      const { entityType, entityId, operation, payload, idempotencyKey } = params;

      // Query existing pending operations for this entityId
      const entityIndex = outboxStore.index('entityId');
      const getReq = entityIndex.getAll(entityId);

      getReq.onsuccess = () => {
        const matching: SyncOperation[] = (getReq.result || []).filter(
          (op: SyncOperation) => op.entityType === entityType && op.status === 'pending'
        );

        const now = Date.now();
        let targetOp: SyncOperation;

        // SAFE COALESCING RULES:
        // Rule A: Completed workouts are durable immutable historical records. Never coalesce different workouts.
        const canCoalesce = entityType !== 'workout' && matching.length > 0;

        if (canCoalesce) {
          const existing = matching[0];

          if (existing.operation === 'create') {
            if (operation === 'update') {
              // Create + Update -> Keep create, update payload & timestamp
              existing.payload = payload;
              existing.updatedAt = now;
              targetOp = existing;
              outboxStore.put(targetOp);
            } else if (operation === 'delete') {
              // Create + Delete before any sync -> Net zero remote effect; remove pending create
              outboxStore.delete(existing.operationId);
              targetOp = {
                ...existing,
                operation: 'delete',
                status: 'synced', // mark cancelled/synced in memory
              };
            } else {
              targetOp = existing;
            }
          } else if (existing.operation === 'update') {
            if (operation === 'update') {
              // Update + Update -> Overwrite payload with latest state
              existing.payload = payload;
              existing.updatedAt = now;
              targetOp = existing;
              outboxStore.put(targetOp);
            } else if (operation === 'delete') {
              // Update + Delete -> Switch to delete tombstone
              existing.operation = 'delete';
              existing.payload = undefined;
              existing.updatedAt = now;
              targetOp = existing;
              outboxStore.put(targetOp);
            } else {
              targetOp = existing;
            }
          } else if (existing.operation === 'delete') {
            if (operation === 'create' || operation === 'update') {
              existing.operation = 'update';
              existing.payload = payload;
              existing.updatedAt = now;
              targetOp = existing;
              outboxStore.put(targetOp);
            } else {
              targetOp = existing;
            }
          } else {
            targetOp = existing;
          }
        } else {
          // No coalescing possible; create fresh operation
          const opId = generateOperationId();
          targetOp = {
            operationId: opId,
            entityType,
            entityId,
            operation,
            payload,
            createdAt: now,
            updatedAt: now,
            status: 'pending',
            retryCount: 0,
            idempotencyKey: idempotencyKey || opId,
          };
          outboxStore.put(targetOp);
        }

        // Update metadata store if included in transaction
        if (metaStore) {
          const metaReq = metaStore.get(SYNC_METADATA_KEY);
          metaReq.onsuccess = () => {
            const currentMeta: SyncMetadata = metaReq.result?.value || {
              syncSchemaVersion: 1,
              lastLocalMutationAt: now,
              lastSuccessfulSyncAt: null,
              syncStatus: 'pending',
              outboxCount: 1,
            };

            metaStore.put({
              key: SYNC_METADATA_KEY,
              value: {
                ...currentMeta,
                lastLocalMutationAt: now,
                syncStatus: 'pending',
              },
              updatedAt: now,
            });
          };
        }

        resolve(targetOp);
      };

      getReq.onerror = () => {
        reject(getReq.error || new Error('Failed to query existing outbox operations'));
      };
    });
  },

  /**
   * Retrieves all pending operations in the outbox, ordered chronologically.
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    return withStore(STORES.SYNC_OUTBOX, 'readonly', (store) => {
      return new Promise<SyncOperation[]>((resolve, reject) => {
        const index = store.index('status');
        const request = index.getAll('pending');

        request.onsuccess = () => {
          const ops: SyncOperation[] = request.result || [];
          ops.sort((a, b) => a.createdAt - b.createdAt);
          resolve(ops);
        };

        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Retrieves all operations regardless of status.
   */
  async getAllOperations(): Promise<SyncOperation[]> {
    return withStore(STORES.SYNC_OUTBOX, 'readonly', (store) => {
      return new Promise<SyncOperation[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const ops: SyncOperation[] = request.result || [];
          ops.sort((a, b) => a.createdAt - b.createdAt);
          resolve(ops);
        };
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Summarizes outbox statistics (pending, failed, synced counts).
   */
  async getOutboxStats(): Promise<OutboxStats> {
    const ops = await this.getAllOperations();
    let pending = 0;
    let failed = 0;
    let synced = 0;

    for (const op of ops) {
      if (op.status === 'pending') pending++;
      else if (op.status === 'failed') failed++;
      else if (op.status === 'synced') synced++;
    }

    return {
      pending,
      failed,
      synced,
      total: ops.length,
    };
  },

  /**
   * Updates dispatch state or failure metadata for a specific operation.
   */
  async updateOperationStatus(
    operationId: string,
    status: SyncOperationStatus,
    errorMessage?: string
  ): Promise<void> {
    return withStore(STORES.SYNC_OUTBOX, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const getReq = store.get(operationId);

        getReq.onsuccess = () => {
          const op: SyncOperation = getReq.result;
          if (!op) {
            resolve();
            return;
          }

          op.status = status;
          op.updatedAt = Date.now();
          if (status === 'failed') {
            op.retryCount = (op.retryCount || 0) + 1;
            op.lastAttemptAt = Date.now();
            op.lastError = errorMessage || 'Operation failed';
          }

          const putReq = store.put(op);
          putReq.onsuccess = () => resolve();
          putReq.onerror = () => reject(putReq.error);
        };

        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  /**
   * Clears all entries from the sync outbox store.
   */
  async clearOutbox(): Promise<void> {
    return withStore(STORES.SYNC_OUTBOX, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  },

  /**
   * Retrieves sync metadata from STORES.METADATA.
   */
  async getSyncMetadata(): Promise<SyncMetadata> {
    return withStore(STORES.METADATA, 'readonly', (store) => {
      return new Promise<SyncMetadata>((resolve) => {
        const req = store.get(SYNC_METADATA_KEY);
        req.onsuccess = () => {
          if (req.result && req.result.value) {
            resolve(req.result.value as SyncMetadata);
          } else {
            resolve({
              syncSchemaVersion: 1,
              lastLocalMutationAt: 0,
              lastSuccessfulSyncAt: null,
              syncStatus: 'local-only',
              outboxCount: 0,
            });
          }
        };
        req.onerror = () => {
          resolve({
            syncSchemaVersion: 1,
            lastLocalMutationAt: 0,
            lastSuccessfulSyncAt: null,
            syncStatus: 'local-only',
            outboxCount: 0,
          });
        };
      });
    });
  },

  /**
   * Updates or resets sync metadata in STORES.METADATA.
   */
  async saveSyncMetadata(metadata: Partial<SyncMetadata>): Promise<void> {
    const current = await this.getSyncMetadata();
    const merged: SyncMetadata = { ...current, ...metadata };

    return withStore(STORES.METADATA, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const req = store.put({
          key: SYNC_METADATA_KEY,
          value: merged,
          updatedAt: Date.now(),
        });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  },
};
