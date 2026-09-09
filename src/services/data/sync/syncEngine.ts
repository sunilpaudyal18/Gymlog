/**
 * Sync Engine - Phase 5 Architecture
 *
 * Local orchestrator responsible for:
 * - Inspecting pending outbox operations in chronological order
 * - Reporting truthful queue metrics (Pending, Failed, Synced)
 * - Maintaining sync metadata in IndexedDB without remote network dependencies
 * - Preserving retry bookkeeping and operation idempotency
 */

import { outboxRepository } from './outboxRepository';
import { SyncOperation, OutboxStats, SyncMetadata, SyncProvider } from './syncTypes';
import { noopSyncProvider } from './noopSyncProvider';

export const syncEngine = {
  privateProvider: noopSyncProvider as SyncProvider,

  /**
   * Sets or updates the active sync provider (retained for future cloud integration).
   */
  setProvider(provider: SyncProvider): void {
    this.privateProvider = provider;
  },

  /**
   * Returns current active sync provider.
   */
  getProvider(): SyncProvider {
    return this.privateProvider;
  },

  /**
   * Returns all pending operations ordered chronologically.
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    return outboxRepository.getPendingOperations();
  },

  /**
   * Summarizes outbox statistics.
   */
  async getStats(): Promise<OutboxStats> {
    return outboxRepository.getOutboxStats();
  },

  /**
   * Retrieves current sync status and metadata from IndexedDB.
   */
  async getStatus(): Promise<SyncMetadata> {
    const stats = await this.getStats();
    const meta = await outboxRepository.getSyncMetadata();

    const status: SyncMetadata['syncStatus'] =
      stats.failed > 0
        ? 'error'
        : stats.pending > 0
        ? 'pending'
        : 'local-only';

    return {
      ...meta,
      outboxCount: stats.pending,
      syncStatus: status,
    };
  },

  /**
   * Records a failure attempt for a given operation with error message.
   */
  async recordFailure(operationId: string, error: string): Promise<void> {
    await outboxRepository.updateOperationStatus(operationId, 'failed', error);
  },

  /**
   * Marks a set of operations as successfully synced (for future remote integration).
   */
  async markSynced(operationIds: string[]): Promise<void> {
    for (const opId of operationIds) {
      await outboxRepository.updateOperationStatus(opId, 'synced');
    }
    await outboxRepository.saveSyncMetadata({
      lastSuccessfulSyncAt: Date.now(),
    });
  },

  /**
   * Resets local outbox and clears sync metadata.
   */
  async reset(): Promise<void> {
    await outboxRepository.clearOutbox();
    await outboxRepository.saveSyncMetadata({
      syncSchemaVersion: 1,
      lastLocalMutationAt: Date.now(),
      lastSuccessfulSyncAt: null,
      syncStatus: 'local-only',
      outboxCount: 0,
    });
  },
};
