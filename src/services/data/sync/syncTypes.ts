/**
 * Local-First Sync Foundation & Outbox Types - Phase 5 Architecture
 *
 * Defines contracts for offline operation logging, idempotency, metadata tracking,
 * and future sync provider interfaces without external server dependencies.
 */

export type SyncEntityType =
  | 'routine'
  | 'exercise'
  | 'workout'
  | 'schedule'
  | 'personal_record';

export type SyncOperationType = 'create' | 'update' | 'delete';

export type SyncOperationStatus = 'pending' | 'failed' | 'synced';

export interface SyncOperation<T = unknown> {
  /**
   * Globally unique identifier for this sync operation (UUID v4).
   * Stable across retries and execution life-cycle.
   */
  operationId: string;

  /**
   * Type of entity targeted by this operation.
   */
  entityType: SyncEntityType;

  /**
   * Stable user identity of the entity (e.g. routine ID, exercise ID, workout ID).
   * Stable across edits and preserved in delete operations.
   */
  entityId: string;

  /**
   * Mutation verb.
   */
  operation: SyncOperationType;

  /**
   * Snapshot payload needed to replay or synchronize the mutation remotely.
   */
  payload?: T;

  /**
   * Epoch timestamp when the operation was first generated.
   */
  createdAt: number;

  /**
   * Epoch timestamp when the operation was coalesced or updated.
   */
  updatedAt?: number;

  /**
   * Current dispatch state.
   */
  status: SyncOperationStatus;

  /**
   * Count of failed transmission attempts.
   */
  retryCount: number;

  /**
   * Timestamp of most recent transmission attempt.
   */
  lastAttemptAt?: number;

  /**
   * Last recorded failure message or error code.
   */
  lastError?: string;

  /**
   * Idempotency token to detect duplicate processing remotely.
   */
  idempotencyKey: string;
}

export interface SyncMetadata {
  syncSchemaVersion: number;
  lastLocalMutationAt: number;
  lastSuccessfulSyncAt: number | null;
  syncStatus: 'local-only' | 'pending' | 'syncing' | 'error';
  outboxCount: number;
}

export interface SyncPushResult {
  success: boolean;
  syncedOperationIds: string[];
  failedOperationIds?: { operationId: string; error: string }[];
  error?: string;
}

export interface SyncPullResult {
  success: boolean;
  cursor?: string;
  operations?: SyncOperation[];
}

export interface SyncProvider {
  name: string;
  push(operations: SyncOperation[]): Promise<SyncPushResult>;
  pull(cursor?: string): Promise<SyncPullResult>;
}

export interface OutboxStats {
  pending: number;
  failed: number;
  synced: number;
  total: number;
}
