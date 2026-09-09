/**
 * Workout Data Service - Local-First Data Layer
 * Encapsulates IndexedDB persistence for completed workouts, active sessions, and personal records.
 */

import { WorkoutSession, PersonalRecord } from '../../types';
import { workoutRepository } from '../database/repositories/workoutRepository';
import { kvGet, withStores, STORES } from '../database/db';
import { outboxRepository } from './sync/outboxRepository';

const PR_STORAGE_KEY = 'gym_personal_records_v3';

export const workoutService = {
  /**
   * Retrieves all completed historical workouts from IndexedDB.
   */
  async getCompletedWorkouts(): Promise<WorkoutSession[]> {
    try {
      return await workoutRepository.getAllCompletedWorkouts();
    } catch (err) {
      console.warn('[WorkoutService] Error reading completed workouts from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Saves a completed workout session to IndexedDB and atomically queues an outbox operation.
   * Workouts are durable historical records and are protected from destructive coalescing.
   */
  async saveCompletedWorkout(session: WorkoutSession): Promise<boolean> {
    try {
      return await withStores(
        [STORES.WORKOUTS, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const workoutStore = stores[STORES.WORKOUTS];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          await new Promise<void>((res, rej) => {
            const putReq = workoutStore.put(session);
            putReq.onsuccess = () => res();
            putReq.onerror = () => rej(putReq.error);
          });

          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'workout',
              entityId: session.id,
              operation: 'create',
              payload: session,
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[WorkoutService] Error saving completed workout to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Retrieves active in-progress workout session from IndexedDB (strictly crash-recovery).
   */
  async getActiveSession(): Promise<WorkoutSession | null> {
    try {
      return await workoutRepository.getActiveSession();
    } catch (err) {
      console.warn('[WorkoutService] Error reading active session from IndexedDB:', err);
      return null;
    }
  },

  /**
   * Persists active in-progress workout session to IndexedDB (crash recovery only, zero sync ops).
   */
  async saveActiveSession(session: WorkoutSession): Promise<boolean> {
    try {
      await workoutRepository.saveActiveSession(session);
      return true;
    } catch (err) {
      console.warn('[WorkoutService] Error persisting active session to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Clears active workout session from IndexedDB (crash recovery only, zero sync ops).
   */
  async clearActiveSession(): Promise<boolean> {
    try {
      await workoutRepository.clearActiveSession();
      return true;
    } catch (err) {
      console.warn('[WorkoutService] Error clearing active session from IndexedDB:', err);
      return false;
    }
  },

  /**
   * Retrieves personal records from IndexedDB kv_store.
   */
  async getPersonalRecords(): Promise<PersonalRecord[]> {
    try {
      const prs = await kvGet<PersonalRecord[]>(PR_STORAGE_KEY);
      return prs || [];
    } catch (err) {
      console.warn('[WorkoutService] Error reading PRs from kv_store:', err);
      return [];
    }
  },

  /**
   * Persists personal records to IndexedDB kv_store and registers outbox update atomically.
   */
  async savePersonalRecords(records: PersonalRecord[]): Promise<boolean> {
    try {
      return await withStores(
        [STORES.KV_STORE, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const kvStore = stores[STORES.KV_STORE];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          const now = Date.now();

          await new Promise<void>((res, rej) => {
            const putReq = kvStore.put({
              key: PR_STORAGE_KEY,
              value: records,
              updatedAt: now,
            });
            putReq.onsuccess = () => res();
            putReq.onerror = () => rej(putReq.error);
          });

          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'personal_record',
              entityId: 'personal_records_singleton',
              operation: 'update',
              payload: records,
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[WorkoutService] Error saving PRs to kv_store:', err);
      return false;
    }
  },
};
