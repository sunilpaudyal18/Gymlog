/**
 * Exercise Data Service - Local-First Data Layer
 * Encapsulates IndexedDB access for custom exercises and library movements.
 * UI components and stores interact through this service rather than direct IDB queries.
 */

import { Exercise } from '../../types';
import { exerciseRepository } from '../database/repositories/exerciseRepository';
import { withStores, STORES } from '../database/db';
import { outboxRepository } from './sync/outboxRepository';

export const exerciseService = {
  /**
   * Retrieves all custom exercises from IndexedDB.
   */
  async getCustomExercises(): Promise<Exercise[]> {
    try {
      return await exerciseRepository.getAllCustomExercises();
    } catch (err) {
      console.warn('[ExerciseService] Error reading custom exercises from IndexedDB:', err);
      return [];
    }
  },

  /**
   * Persists a custom exercise directly into IndexedDB and logs sync outbox operation atomically.
   */
  async saveCustomExercise(exercise: Exercise): Promise<boolean> {
    try {
      const normalized: Exercise = {
        ...exercise,
        isCustom: true,
      };

      return await withStores(
        [STORES.EXERCISES, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const exerciseStore = stores[STORES.EXERCISES];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          // Check if exercise already exists in store
          const existingReq = exerciseStore.get(normalized.id);
          const existing = await new Promise<Exercise | undefined>((res) => {
            existingReq.onsuccess = () => res(existingReq.result as Exercise);
            existingReq.onerror = () => res(undefined);
          });

          const isUpdate = !!existing;
          const toSave = {
            ...normalized,
            updatedAt: Date.now(),
          };

          await new Promise<void>((res, rej) => {
            const putReq = exerciseStore.put(toSave);
            putReq.onsuccess = () => res();
            putReq.onerror = () => rej(putReq.error);
          });

          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'exercise',
              entityId: normalized.id,
              operation: isUpdate ? 'update' : 'create',
              payload: toSave,
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[ExerciseService] Failed to save custom exercise to IndexedDB:', err);
      return false;
    }
  },

  /**
   * Removes a custom exercise from IndexedDB and registers delete outbox operation atomically.
   */
  async deleteCustomExercise(id: string): Promise<boolean> {
    try {
      return await withStores(
        [STORES.EXERCISES, STORES.SYNC_OUTBOX, STORES.METADATA],
        'readwrite',
        async (stores) => {
          const exerciseStore = stores[STORES.EXERCISES];
          const outboxStore = stores[STORES.SYNC_OUTBOX];
          const metaStore = stores[STORES.METADATA];

          await new Promise<void>((res, rej) => {
            const delReq = exerciseStore.delete(id);
            delReq.onsuccess = () => res();
            delReq.onerror = () => rej(delReq.error);
          });

          await outboxRepository.queueOperationInTx(
            outboxStore,
            {
              entityType: 'exercise',
              entityId: id,
              operation: 'delete',
            },
            metaStore
          );

          return true;
        }
      );
    } catch (err) {
      console.error('[ExerciseService] Failed to delete custom exercise from IndexedDB:', err);
      return false;
    }
  },
};
