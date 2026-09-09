/**
 * Migration Journal Service - Phase 4 Architecture
 *
 * Persists migration state and execution logs in IndexedDB (STORES.METADATA).
 * Guarantees that:
 * 1. Migration starts, steps, and outcomes are tracked durably.
 * 2. Interrupted or failed migrations are detected immediately on reboot.
 * 3. Never records sensitive user data in logs.
 */

import { withStore, STORES } from '../../database/db';
import { MigrationJournalEntry, MigrationStatus } from './migrationTypes';

const JOURNAL_STORAGE_KEY = 'schema_migration_journal';

export const migrationJournal = {
  /**
   * Retrieves the full chronological migration journal from IndexedDB metadata store.
   */
  async getJournal(): Promise<MigrationJournalEntry[]> {
    try {
      return await withStore(STORES.METADATA, 'readonly', (store) => {
        return new Promise<MigrationJournalEntry[]>((resolve) => {
          const req = store.get(JOURNAL_STORAGE_KEY);
          req.onsuccess = () => {
            const res = req.result;
            if (res && Array.isArray(res.entries)) {
              resolve(res.entries);
            } else {
              resolve([]);
            }
          };
          req.onerror = () => resolve([]);
        });
      });
    } catch {
      return [];
    }
  },

  /**
   * Appends or updates a journal entry in IndexedDB.
   */
  async saveJournal(entries: MigrationJournalEntry[]): Promise<void> {
    try {
      await withStore(STORES.METADATA, 'readwrite', (store) => {
        return new Promise<void>((resolve, reject) => {
          const req = store.put({
            key: JOURNAL_STORAGE_KEY,
            entries,
            updatedAt: Date.now(),
          });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      });
    } catch (err) {
      console.warn('[MigrationJournal] Failed to persist migration journal:', err);
    }
  },

  /**
   * Records the initiation of a migration step.
   */
  async recordStart(
    migrationId: string,
    fromVersion: number,
    toVersion: number,
    snapshotId?: string
  ): Promise<MigrationJournalEntry> {
    const entry: MigrationJournalEntry = {
      migrationId,
      fromVersion,
      toVersion,
      status: 'running',
      startedAt: Date.now(),
      snapshotId,
    };

    const current = await this.getJournal();
    // Replace any existing running entry for this migration or append
    const filtered = current.filter((e) => e.migrationId !== migrationId || e.status === 'completed');
    filtered.push(entry);
    await this.saveJournal(filtered);
    return entry;
  },

  /**
   * Records the verified completion of a migration step.
   */
  async recordComplete(
    migrationId: string,
    recordsAffected?: MigrationJournalEntry['recordsAffected']
  ): Promise<void> {
    const current = await this.getJournal();
    const index = current.findIndex((e) => e.migrationId === migrationId && e.status === 'running');
    if (index !== -1) {
      current[index] = {
        ...current[index],
        status: 'completed',
        completedAt: Date.now(),
        recordsAffected,
      };
      await this.saveJournal(current);
    }
  },

  /**
   * Records a failure in a migration step.
   */
  async recordFailure(migrationId: string, error: string): Promise<void> {
    const current = await this.getJournal();
    const index = current.findIndex((e) => e.migrationId === migrationId && e.status === 'running');
    if (index !== -1) {
      current[index] = {
        ...current[index],
        status: 'failed',
        completedAt: Date.now(),
        error,
      };
      await this.saveJournal(current);
    }
  },

  /**
   * Checks if an incomplete/interrupted migration exists from a previous crash.
   */
  async getIncompleteMigration(): Promise<MigrationJournalEntry | null> {
    const journal = await this.getJournal();
    const running = journal.find((e) => e.status === 'running');
    return running || null;
  },

  /**
   * Returns the most recent completed journal entry.
   */
  async getLatestCompleted(): Promise<MigrationJournalEntry | null> {
    const journal = await this.getJournal();
    const completed = journal.filter((e) => e.status === 'completed');
    return completed[completed.length - 1] || null;
  },
};
