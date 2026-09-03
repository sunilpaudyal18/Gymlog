/**
 * Workout Repository
 * Manages active session persistence, crash recovery state, and completed history in IndexedDB.
 */

import { withStore, STORES } from '../db';
import { WorkoutSession } from '../../../types';

const ACTIVE_SESSION_KEY = 'active_workout_session';

export const workoutRepository = {
  /**
   * Persists the active session immediately to IndexedDB for crash recovery.
   */
  async saveActiveSession(session: WorkoutSession): Promise<void> {
    await withStore(STORES.ACTIVE_SESSION, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: ACTIVE_SESSION_KEY,
          session,
          updatedAt: Date.now(),
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Retrieves the currently active session from IndexedDB (used for crash recovery on boot).
   */
  async getActiveSession(): Promise<WorkoutSession | null> {
    return withStore(STORES.ACTIVE_SESSION, 'readonly', (store) => {
      return new Promise<WorkoutSession | null>((resolve, reject) => {
        const request = store.get(ACTIVE_SESSION_KEY);
        request.onsuccess = () => {
          if (request.result && request.result.session) {
            resolve(request.result.session as WorkoutSession);
          } else {
            resolve(null);
          }
        };
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Clears the active session from IndexedDB upon workout completion or cancellation.
   */
  async clearActiveSession(): Promise<void> {
    await withStore(STORES.ACTIVE_SESSION, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(ACTIVE_SESSION_KEY);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Saves a finished workout to the historical workouts store.
   */
  async saveCompletedWorkout(session: WorkoutSession): Promise<void> {
    await withStore(STORES.WORKOUTS, 'readwrite', (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(session);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
  },

  /**
   * Retrieves all completed historical workout sessions.
   */
  async getAllCompletedWorkouts(): Promise<WorkoutSession[]> {
    return withStore(STORES.WORKOUTS, 'readonly', (store) => {
      return new Promise<WorkoutSession[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve((request.result as WorkoutSession[]) || []);
        };
        request.onerror = () => reject(request.error);
      });
    });
  },
};
