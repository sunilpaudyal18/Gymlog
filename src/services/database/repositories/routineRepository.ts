/**
 * Routine Repository
 * Manages routine CRUD and schedule mapping in IndexedDB.
 */

import { withStore, STORES } from '../db';
import { Routine } from '../../../types';

export const routineRepository = {
  async getAllRoutines(): Promise<Routine[]> {
    return withStore(STORES.ROUTINES, 'readonly', (store) => {
      return new Promise<Routine[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve((request.result as Routine[]) || []);
        request.onerror = () => reject(request.error);
      });
    });
  },

  async saveRoutine(routine: Routine): Promise<void> {
    await withStore(STORES.ROUTINES, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put({
          ...routine,
          updatedAt: Date.now(),
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  async deleteRoutine(id: string): Promise<void> {
    await withStore(STORES.ROUTINES, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },
};
