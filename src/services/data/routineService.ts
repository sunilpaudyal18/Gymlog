/**
 * Routine Data Service - Local-First Data Layer
 * Encapsulates IndexedDB persistence for user routines and weekly splits.
 */

import { Routine } from '../../types';
import { routineRepository } from '../database/repositories/routineRepository';
import { kvGet, kvSet, withStores, STORES } from '../database/db';
import { outboxRepository } from './sync/outboxRepository';

const SCHEDULE_STORAGE_KEY = 'gym_planner_schedule_v3';

export interface PlannerScheduleData {
  weeklySchedule: Record<number, string | null>;
  splitName: string;
}

export const routineService = {
  /**
   * Retrieves all user-defined routines from IndexedDB.
   */
  async getRoutines(): Promise<Routine[]> {
    try {
      return await routineRepository.getAllRoutines();
    } catch (err) {
      console.warn('[RoutineService] Error reading routines from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Persists a routine into IndexedDB and atomically registers a sync outbox operation.
   */
  async saveRoutine(routine: Routine): Promise<boolean> {
    try {
      return await withStores(
        [STORES.ROUTINES, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const routineStore = stores[STORES.ROUTINES];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          // Check if routine already exists to determine create vs update
          const existingReq = routineStore.get(routine.id);
          const existing = await new Promise<Routine | undefined>((res) => {
            existingReq.onsuccess = () => res(existingReq.result as Routine);
            existingReq.onerror = () => res(undefined);
          });

          const isUpdate = !!existing;
          const enrichedRoutine: Routine = {
            ...routine,
            updatedAt: Date.now(),
          };

          // Put routine in routines store
          await new Promise<void>((res, rej) => {
            const putReq = routineStore.put(enrichedRoutine);
            putReq.onsuccess = () => res();
            putReq.onerror = () => rej(putReq.error);
          });

          // Queue operation in outbox store
          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'routine',
              entityId: routine.id,
              operation: isUpdate ? 'update' : 'create',
              payload: enrichedRoutine,
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[RoutineService] Failed to save routine to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Deletes a routine by ID from IndexedDB and atomically registers a delete outbox operation.
   */
  async deleteRoutine(id: string): Promise<boolean> {
    try {
      return await withStores(
        [STORES.ROUTINES, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const routineStore = stores[STORES.ROUTINES];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          // Delete routine from routines store
          await new Promise<void>((res, rej) => {
            const delReq = routineStore.delete(id);
            delReq.onsuccess = () => res();
            delReq.onerror = () => rej(delReq.error);
          });

          // Queue delete operation in outbox store
          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'routine',
              entityId: id,
              operation: 'delete',
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[RoutineService] Failed to delete routine from IndexedDB:', err);
      return false;
    }
  },

  /**
   * Loads weekly schedule and split name from IndexedDB kv_store with fallback migration.
   */
  async getPlannerSchedule(): Promise<PlannerScheduleData | null> {
    try {
      // 1. Primary: Fetch from dedicated kv_store schedule key
      const direct = await kvGet<PlannerScheduleData>(SCHEDULE_STORAGE_KEY);
      if (direct && direct.weeklySchedule) {
        return direct;
      }

      // 2. Fallback: Inspect kv_store for legacy gym_routines_store_v2
      const legacyKv = await kvGet<any>('gym_routines_store_v2');
      if (legacyKv) {
        const parsed = typeof legacyKv === 'string' ? JSON.parse(legacyKv) : legacyKv;
        const state = parsed?.state || parsed;
        if (state?.weeklySchedule) {
          const scheduleData: PlannerScheduleData = {
            weeklySchedule: state.weeklySchedule,
            splitName: state.splitName || 'My Routine Planner',
          };
          // Persist forward into SCHEDULE_STORAGE_KEY
          await kvSet(SCHEDULE_STORAGE_KEY, scheduleData).catch(() => {});
          return scheduleData;
        }
      }

      // 3. Fallback: Inspect localStorage for legacy gym_routines_store_v2
      if (typeof window !== 'undefined' && window.localStorage) {
        const lsRaw = localStorage.getItem('gym_routines_store_v2');
        if (lsRaw) {
          try {
            const parsed = JSON.parse(lsRaw);
            const state = parsed?.state || parsed;
            if (state?.weeklySchedule) {
              const scheduleData: PlannerScheduleData = {
                weeklySchedule: state.weeklySchedule,
                splitName: state.splitName || 'My Routine Planner',
              };
              await kvSet(SCHEDULE_STORAGE_KEY, scheduleData).catch(() => {});
              return scheduleData;
            }
          } catch (_) {}
        }
      }

      return null;
    } catch (err) {
      console.warn('[RoutineService] Error reading schedule from kv_store:', err);
      return null;
    }
  },

  /**
   * Persists weekly schedule and split name to IndexedDB kv_store and outbox atomically.
   */
  async savePlannerSchedule(schedule: Record<number, string | null>, splitName: string): Promise<boolean> {
    try {
      return await withStores(
        [STORES.KV_STORE, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const kvStore = stores[STORES.KV_STORE];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          const now = Date.now();
          const scheduleData: PlannerScheduleData = {
            weeklySchedule: schedule,
            splitName,
          };

          await new Promise<void>((res, rej) => {
            const putReq = kvStore.put({
              key: SCHEDULE_STORAGE_KEY,
              value: scheduleData,
              updatedAt: now,
            });
            putReq.onsuccess = () => res();
            putReq.onerror = () => rej(putReq.error);
          });

          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'schedule',
              entityId: 'weekly_schedule_singleton',
              operation: 'update',
              payload: scheduleData,
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[RoutineService] Error saving schedule to kv_store:', err);
      return false;
    }
  },

  /**
   * Clears planner schedule from kv_store on complete data reset.
   */
  async clearPlannerSchedule(): Promise<void> {
    try {
      const { kvDelete } = await import('../database/db');
      await kvDelete(SCHEDULE_STORAGE_KEY);
    } catch (err) {
      console.warn('[RoutineService] Error clearing schedule from kv_store:', err);
    }
  },
};
