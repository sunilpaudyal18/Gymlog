import { useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { useRoutineStore } from '../stores/useRoutineStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { Routine, WorkoutSession } from '../types';
import { getCurrentDayIndex, isSameCalendarDay, REST_DAY_INFO, DAY_NAMES } from '../utils/scheduler';

export type TodayWorkoutStatus = 'not_started' | 'in_progress' | 'completed' | 'rest_day';

export interface TodaySessionInfo {
  routineId: string | null;
  routineName: string;
  status: TodayWorkoutStatus;
  isRestDay: boolean;
  todayRoutine: Routine | null;
  activeSession: WorkoutSession | null;
  hasOngoingLiveSession: boolean;
  hasCompletedSets: boolean;
  isCompletedToday: boolean;
  todayName: string;
  restInfo: { title: string; subtitle: string; tag: string };
  swapToRoutine: (routineId: string | null, forceDiscard?: boolean) => boolean;
  startWorkout: () => void;
  resumeWorkout: () => void;
  discardOngoingWorkout: () => void;
}

export function useTodaySession(): TodaySessionInfo {
  const navigate = useNavigate();
  const {
    activeSession,
    startWorkoutFromRoutine,
    cancelWorkout,
  } = useWorkoutStore();

  const {
    routines,
    weeklySchedule,
    swapTodayRoutine,
    getTodayScheduledRoutine,
  } = useRoutineStore();

  const { completedSessions } = useHistoryStore();

  const todayIndex = getCurrentDayIndex();
  const todayName = DAY_NAMES[todayIndex] || 'Today';
  const restInfo = REST_DAY_INFO[todayIndex] || {
    title: 'Active Recovery & Rest',
    subtitle: 'Prioritize muscle repair, hydration, and central nervous system restoration.',
    tag: 'RECOVERY DAY',
  };

  // Get current routine scheduled for today (or null if rest day)
  const todayRoutine = getTodayScheduledRoutine();
  const isRestDay = !todayRoutine;

  // Check if a workout has already been completed today
  const isCompletedToday = useMemo(() => {
    return completedSessions.some((s) =>
      isSameCalendarDay(s.completedAt || s.startedAt, Date.now())
    );
  }, [completedSessions]);

  // Check ongoing session status
  const hasOngoingLiveSession = Boolean(
    activeSession && activeSession.status === 'in_progress' && !isRestDay
  );

  const hasCompletedSets = Boolean(
    activeSession?.exercises?.some((ex) => ex.sets?.some((s) => s.completed))
  );

  // Auto-cleanup: If today is a rest day, dismiss any stale activeSession
  useEffect(() => {
    if (isRestDay && activeSession) {
      // If today is a rest day, dismiss the lingering session
      cancelWorkout();
    }
  }, [isRestDay, activeSession, cancelWorkout]);

  // Unified status
  const status: TodayWorkoutStatus = useMemo(() => {
    if (isRestDay) return 'rest_day';
    if (isCompletedToday) return 'completed';
    if (hasOngoingLiveSession && activeSession?.routineId === todayRoutine?.id) {
      return 'in_progress';
    }
    return 'not_started';
  }, [isRestDay, isCompletedToday, hasOngoingLiveSession, activeSession, todayRoutine]);

  const routineName = isRestDay
    ? restInfo.title
    : todayRoutine?.name || 'Scheduled Workout';

  const routineId = isRestDay ? null : todayRoutine?.id || null;

  // Centralized swap routine action
  const swapToRoutine = useCallback(
    (targetRoutineId: string | null, forceDiscard = false): boolean => {
      // If there is an ongoing live session with completed sets, require user confirmation
      if (activeSession && activeSession.status === 'in_progress' && hasCompletedSets && !forceDiscard) {
        // If switching to the exact same routine that is currently in progress, no discard needed
        if (targetRoutineId === activeSession.routineId) {
          return true;
        }
        // Confirmation required
        return false;
      }

      // If switching to Rest Day:
      if (targetRoutineId === null) {
        cancelWorkout();
        swapTodayRoutine(null);
        return true;
      }

      // If switching to another routine:
      const target = routines.find((r) => r.id === targetRoutineId) || null;
      if (target) {
        // If a session was live in progress, start the new session immediately
        if (activeSession && activeSession.status === 'in_progress') {
          startWorkoutFromRoutine(target);
        } else {
          // Reset any stale session
          cancelWorkout();
        }
        swapTodayRoutine(targetRoutineId);
        return true;
      }

      return false;
    },
    [
      activeSession,
      hasCompletedSets,
      cancelWorkout,
      swapTodayRoutine,
      routines,
      startWorkoutFromRoutine,
    ]
  );

  const startWorkout = useCallback(() => {
    if (todayRoutine) {
      startWorkoutFromRoutine(todayRoutine);
      navigate('/workout-mode');
    } else {
      navigate('/workouts');
    }
  }, [todayRoutine, startWorkoutFromRoutine, navigate]);

  const resumeWorkout = useCallback(() => {
    if (activeSession) {
      navigate('/workout-mode');
    } else if (todayRoutine) {
      startWorkoutFromRoutine(todayRoutine);
      navigate('/workout-mode');
    } else {
      navigate('/workouts');
    }
  }, [activeSession, todayRoutine, startWorkoutFromRoutine, navigate]);

  const discardOngoingWorkout = useCallback(() => {
    cancelWorkout();
  }, [cancelWorkout]);

  return {
    routineId,
    routineName,
    status,
    isRestDay,
    todayRoutine,
    activeSession,
    hasOngoingLiveSession,
    hasCompletedSets,
    isCompletedToday,
    todayName,
    restInfo,
    swapToRoutine,
    startWorkout,
    resumeWorkout,
    discardOngoingWorkout,
  };
}
