/**
 * Active Workout Crash Recovery Service
 * Inspects IndexedDB on application boot for lingering in-progress workouts,
 * restores them into useWorkoutStore, and signals the UI to display the recovery banner.
 */

import { workoutRepository } from '../database/repositories/workoutRepository';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { WorkoutSession } from '../../types';

export interface CrashRecoveryResult {
  recovered: boolean;
  session?: WorkoutSession;
  completedSetsCount?: number;
}

type RecoveryListener = (result: CrashRecoveryResult) => void;
const recoveryListeners = new Set<RecoveryListener>();

let hasCheckedRecovery = false;

export const crashRecoveryService = {
  /**
   * Subscribe to crash recovery events.
   */
  subscribe(listener: RecoveryListener): () => void {
    recoveryListeners.add(listener);
    return () => recoveryListeners.delete(listener);
  },

  /**
   * Checks for an active session in IndexedDB on application launch.
   */
  async checkAndRecover(): Promise<CrashRecoveryResult> {
    if (hasCheckedRecovery) {
      return { recovered: false };
    }
    hasCheckedRecovery = true;

    try {
      const storedSession = await workoutRepository.getActiveSession();

      if (
        storedSession &&
        storedSession.status === 'in_progress' &&
        Array.isArray(storedSession.exercises)
      ) {
        // Count completed sets
        const completedSetsCount = storedSession.exercises.reduce((acc, ex) => {
          return acc + (ex.sets ? ex.sets.filter((s) => s.completed).length : 0);
        }, 0);

        // Synchronize with workout store
        useWorkoutStore.setState({
          activeSession: storedSession,
        });

        const result: CrashRecoveryResult = {
          recovered: true,
          session: storedSession,
          completedSetsCount,
        };

        // Notify all UI listeners
        recoveryListeners.forEach((listener) => listener(result));
        return result;
      }

      return { recovered: false };
    } catch (err) {
      console.warn('[CrashRecovery] Error inspecting active session in IndexedDB:', err);
      return { recovered: false };
    }
  },
};
