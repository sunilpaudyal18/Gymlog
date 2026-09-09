/**
 * Active Workout Crash Recovery Service
 * Inspects IndexedDB on application boot for in-progress workouts,
 * restores them into useWorkoutStore, and signals the UI to display the recovery banner.
 *
 * Hardened Crash & Reload Protections:
 * - Never destroys in-progress workouts due to schedule mismatches or midnight date rollovers.
 * - Restores active sessions even when routine store is still hydrating.
 * - Retains active session across app updates, browser reboots, and sudden tab crashes.
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

// Consider sessions older than 36 hours with 0 completed sets as abandoned
const MAX_ABANDONED_AGE_MS = 36 * 60 * 60 * 1000;

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
   * Restores any valid in-progress session into useWorkoutStore.
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
        Array.isArray(storedSession.exercises) &&
        storedSession.exercises.length > 0
      ) {
        // Count completed sets
        const completedSetsCount = storedSession.exercises.reduce((acc, ex) => {
          return acc + (ex.sets ? ex.sets.filter((s) => s.completed).length : 0);
        }, 0);

        // Check for abandoned session (older than 36h with zero completed sets)
        const sessionAge = Date.now() - (storedSession.startedAt || 0);
        if (sessionAge > MAX_ABANDONED_AGE_MS && completedSetsCount === 0) {
          console.info('[CrashRecovery] Discarding ancient abandoned empty session (>36h old).');
          await workoutRepository.clearActiveSession();
          useWorkoutStore.setState({ activeSession: null });
          return { recovered: false };
        }

        // Synchronize restored active session with workout store
        useWorkoutStore.setState({
          activeSession: storedSession,
        });

        const result: CrashRecoveryResult = {
          recovered: true,
          session: storedSession,
          completedSetsCount,
        };

        // Notify all UI listeners
        recoveryListeners.forEach((listener) => {
          try {
            listener(result);
          } catch (err) {
            console.warn('[CrashRecovery] Error in recovery listener:', err);
          }
        });

        return result;
      }

      return { recovered: false };
    } catch (err) {
      console.warn('[CrashRecovery] Error inspecting active session in IndexedDB:', err);
      return { recovered: false };
    }
  },
};
