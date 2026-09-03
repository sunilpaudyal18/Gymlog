/**
 * Exercise Repository
 * Manages custom movements and exercise metadata in IndexedDB.
 */

import { withStore, STORES } from '../db';
import { Exercise } from '../../../types';

export const exerciseRepository = {
  async getAllCustomExercises(): Promise<Exercise[]> {
    return withStore(STORES.EXERCISES, 'readonly', (store) => {
      return new Promise<Exercise[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result as Exercise[]) || []);
        request.onerror = () => reject(request.error);
      });
    });
  },

  async saveCustomExercise(exercise: Exercise): Promise<void> {
    await withStore(STORES.EXERCISES, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put({
          ...exercise,
          isCustom: true,
          updatedAt: Date.now(),
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  async deleteCustomExercise(id: string): Promise<void> {
    await withStore(STORES.EXERCISES, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
};
