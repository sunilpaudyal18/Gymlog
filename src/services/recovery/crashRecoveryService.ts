/**
 * Active Workout Crash Recovery Service
 * Inspects IndexedDB on application boot for lingering in-progress workouts,
 * restores them into useWorkoutStore, and signals the UI to display the recovery banner.
 */

import { workoutRepository } from '../database/repositories/workoutRepository';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { isSameCalendarDay } from '../../utils/scheduler';
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
   * Dynamically cross-references the current day of week and user's active routine schedule.
   * Suppresses and auto-clears stale/mismatched active sessions.
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
        // Real-Time Day Resolution & Active Routine Cross-Referencing
        const todayRoutine = useRoutineStore.getState().getTodayScheduledRoutine();
        const isToday = storedSession.startedAt
          ? isSameCalendarDay(storedSession.startedAt, Date.now())
          : false;

        // Verify if session belongs to today's scheduled split and today is not a rest day
        const isDayMatched = Boolean(todayRoutine && storedSession.routineId === todayRoutine.id);

        if (!isToday || !isDayMatched) {
          console.warn('[CrashRecovery] Suppressing stale or mismatched active session:', {
            sessionRoutineId: storedSession.routineId,
            sessionRoutineName: storedSession.routineName,
            sessionStartedAt: storedSession.startedAt,
            isToday,
            todayRoutineId: todayRoutine?.id ?? 'rest_day',
            todayRoutineName: todayRoutine?.name ?? 'Rest Day',
          });

          // Auto-update / clear stale active session to prevent mismatched alerts
          await workoutRepository.clearActiveSession();
          useWorkoutStore.setState({ activeSession: null });
          return { recovered: false };
        }

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
