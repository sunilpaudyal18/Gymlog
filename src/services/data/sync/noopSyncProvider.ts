/**
 * No-op Sync Provider - Phase 5 Reference Implementation
 *
 * Adheres to SyncProvider abstraction without performing any remote network calls.
 * Ensures the architecture is cloud-ready for future phases while remaining strictly local-first.
 */

import { SyncProvider, SyncOperation, SyncPushResult, SyncPullResult } from './syncTypes';

export class NoopSyncProvider implements SyncProvider {
  name = 'local-offline-provider';

  /**
   * Simulated push that acknowledges operations locally without contacting a remote server.
   * In Phase 5, this explicitly does not mark operations as remotely synced.
   */
  async push(operations: SyncOperation[]): Promise<SyncPushResult> {
    return {
      success: true,
      syncedOperationIds: [],
    };
  }

  /**
   * Simulated pull that returns zero remote changes.
   */
  async pull(cursor?: string): Promise<SyncPullResult> {
    return {
      success: true,
      cursor,
      operations: [],
    };
  }
}

export const noopSyncProvider = new NoopSyncProvider();
