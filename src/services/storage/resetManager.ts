/**
 * Centralized Application Data Reset Engine
 * Deeply purges:
 * 1. All IndexedDB object stores inside `gym_offline_db` (workouts, active_session, routines, exercises, snapshots, kv_store).
 * 2. LocalStorage user persistence keys (user_saved_routines, user_custom_exercises, Zustand caches, quarantined backups).
 * 3. In-memory Zustand state across all active stores (Routines, WorkoutSession, History, ExerciseLibrary).
 *
 * Dispatches a global event for immediate, reload-free UI state updates.
 */

import { clearAllDatabaseStores, kvSet } from '../database/db';
import { PROTECTED_STORAGE_KEYS } from './protectedStorage';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { PRESET_EXERCISES } from '../../constants/exercises';
import { MIGRATION_MARKER } from '../data/migrationService';
import { routineService } from '../data/routineService';

export async function executeCompleteDataPurge(): Promise<void> {
  // 1. Deep IndexedDB clearance across all object stores
  try {
    await clearAllDatabaseStores();
    // Guarantee migration marker remains set in kv_store so boot doesn't resurrect legacy data
    await kvSet(MIGRATION_MARKER, 'completed').catch(() => {});
  } catch (idbErr) {
    console.error('[ResetManager] Error clearing IndexedDB stores:', idbErr);
  }

  // Clear planner schedule explicitly
  await routineService.clearPlannerSchedule().catch(() => {});

  // 2. Wipe LocalStorage user & Zustand persist keys
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToPurge = [
        PROTECTED_STORAGE_KEYS.SAVED_ROUTINES,
        PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES,
        `${PROTECTED_STORAGE_KEYS.SAVED_ROUTINES}_corrupted_bak`,
        `${PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES}_corrupted_bak`,
        'gym_user_custom_exercises',
        'gym_routines_store_v2',
        'gym_exercise_library_store_v2',
        'gym_active_workout_store',
        'gym_history_store_v2',
        'gym_planner_schedule_v3',
        'gym_offline_backup_metadata',
      ];

      keysToPurge.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (_) {}
      });

      // Maintain migration marker in localStorage to guarantee idempotency
      try {
        localStorage.setItem(MIGRATION_MARKER, 'completed');
      } catch (_) {}
    }
  } catch (lsErr) {
    console.warn('[ResetManager] LocalStorage clearance non-critical error:', lsErr);
  }

  // 3. Event-Driven In-Memory State Reset (Zero Browser Reload Required)
  // Routine Store -> Pristine Empty Split (No Pre-built Routines)
  useRoutineStore.setState(
    {
      routines: [],
      activeRoutineId: '',
      weeklySchedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
      splitName: 'My Routine Planner',
      isHydrated: true,
    },
    false
  );

  // Workout Store -> Cancel Active Session & Reset Timers
  useWorkoutStore.setState(
    {
      activeSession: null,
      currentExerciseIndex: 0,
      activeSetIndex: 0,
      isPaused: false,
      timerState: 'idle',
      restStartedAt: null,
      restTargetSeconds: 120,
      restEndsAt: null,
      pausedAt: null,
      remainingWhenPaused: null,
      restTimeRemaining: 0,
      showRestModal: false,
      timerIntervalId: null,
    },
    false
  );

  // History Store -> Zero History & Zero Records
  useHistoryStore.setState(
    {
      completedSessions: [],
      personalRecords: [],
    },
    false
  );

  // Exercise Store -> Remove Custom Exercises, Retain Standard Library
  useExerciseStore.setState(
    {
      exercises: PRESET_EXERCISES.filter((ex) => !ex.isCustom),
      searchQuery: '',
      selectedMuscleFilter: 'all',
      selectedEquipmentFilter: 'all',
      favorites: [],
      recentExerciseIds: [],
      multiSelectedIds: [],
    },
    false
  );

  // 4. Dispatch global reset event for any active listeners / toasts
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('gym:data-reset', { detail: { timestamp: Date.now() } })
    );
  }
}
