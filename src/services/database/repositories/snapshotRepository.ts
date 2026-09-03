/**
 * Snapshot Repository
 * Generates and manages lightweight local recovery snapshots (keeps latest 3).
 * Helps recover from corrupted states, accidental deletions, or failed migrations.
 */

import { withStore, STORES } from '../db';
import { Routine, WorkoutSession, PersonalRecord, UserProfile, Exercise } from '../../../types';

export interface RecoverySnapshot {
  id: string;
  createdAt: number;
  tag: string;
  payload: {
    routines: Routine[];
    completedSessions: WorkoutSession[];
    personalRecords: PersonalRecord[];
    customExercises: Exercise[];
    profile?: UserProfile;
    preferences?: any;
    activeSession?: WorkoutSession | null;
  };
}

const MAX_SNAPSHOTS = 3;

export const snapshotRepository = {
  /**
   * Creates a new recovery snapshot and automatically prunes snapshots older than the top 3.
   */
  async createSnapshot(
    payload: RecoverySnapshot['payload'],
    tag = 'auto_backup'
  ): Promise<string> {
    const id = `snap-${Date.now()}`;
    const snapshot: RecoverySnapshot = {
      id,
      createdAt: Date.now(),
      tag,
      payload,
    };

    // Save snapshot
    await withStore(STORES.SNAPSHOTS, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(snapshot);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    // Prune older snapshots beyond retention limit
    await this.pruneOldSnapshots();

    return id;
  },

  /**
   * Retrieves all available local recovery snapshots ordered newest first.
   */
  async getAllSnapshots(): Promise<RecoverySnapshot[]> {
    return withStore(STORES.SNAPSHOTS, 'readonly', (store) => {
      return new Promise<RecoverySnapshot[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const list = (request.result as RecoverySnapshot[]) || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Retrieves a snapshot by ID.
   */
  async getSnapshot(id: string): Promise<RecoverySnapshot | null> {
    return withStore(STORES.SNAPSHOTS, 'readonly', (store) => {
      return new Promise<RecoverySnapshot | null>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve((request.result as RecoverySnapshot) || null);
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Enforces retention policy: keeps at most MAX_SNAPSHOTS (3) most recent snapshots.
   */
  async pruneOldSnapshots(): Promise<void> {
    const snapshots = await this.getAllSnapshots();
    if (snapshots.length <= MAX_SNAPSHOTS) return;

    const toDelete = snapshots.slice(MAX_SNAPSHOTS);
    for (const item of toDelete) {
      await withStore(STORES.SNAPSHOTS, 'readwrite', (store) => {
        return new Promise<void>((resolve, reject) => {
          const req = store.delete(item.id);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      });
    }
  },
};
