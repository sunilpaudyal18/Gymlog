import { useRoutineStore } from '../stores/useRoutineStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useExerciseStore } from '../stores/useExerciseStore';
import { useUserStore } from '../stores/useUserStore';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { Routine, WorkoutSession, PersonalRecord, UserProfile, Exercise } from '../types';
import { snapshotRepository } from '../services/database/repositories/snapshotRepository';
import { workoutRepository } from '../services/database/repositories/workoutRepository';
import { routineRepository } from '../services/database/repositories/routineRepository';
import { exerciseRepository } from '../services/database/repositories/exerciseRepository';
import { routineService } from '../services/data/routineService';

export const DATA_SCHEMA_VERSION = 1;

export interface GymBackupPayload {
  version: number;
  exportedAt: number;
  appName: string;
  type?: 'routines_export' | 'full_backup';
  profile?: UserProfile;
  preferences?: any;
  routines: Routine[];
  weeklySchedule?: Record<number, string | null>;
  splitName?: string;
  completedSessions?: WorkoutSession[];
  personalRecords?: PersonalRecord[];
  favorites?: string[];
  customExercises?: Exercise[];
  activeSession?: WorkoutSession | null;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  data?: GymBackupPayload;
  summary?: {
    routinesCount: number;
    exercisesCount?: number;
    sessionsCount: number;
    prsCount: number;
    customExercisesCount: number;
  };
}

/**
 * Collects current workout routine data (routines, routine exercises, and planner schedule)
 * and downloads it as a formatted JSON file.
 * Excludes user profile, personal data, workout history, and personal records.
 */
export function exportBackupData(): void {
  const routineState = useRoutineStore.getState();
  const exerciseState = useExerciseStore.getState();

  const routines = routineState.routines;

  // Collect custom exercises referenced in routines to ensure completeness
  const routineExerciseIds = new Set<string>();
  routines.forEach((r) => {
    if (Array.isArray(r.exercises)) {
      r.exercises.forEach((e) => {
        if (e.exerciseId) routineExerciseIds.add(e.exerciseId);
      });
    }
  });

  const relevantCustomExercises = exerciseState.exercises.filter(
    (e) => e.isCustom && routineExerciseIds.has(e.id)
  );

  const payload: GymBackupPayload = {
    version: DATA_SCHEMA_VERSION,
    exportedAt: Date.now(),
    appName: 'GYM',
    type: 'routines_export',
    routines,
    weeklySchedule: routineState.weeklySchedule,
    splitName: routineState.splitName,
    customExercises: relevantCustomExercises,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  const filename = `gym-routines-${today}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates the schema and structure of an uploaded backup JSON file.
 */
export function validateBackupData(jsonString: string): BackupValidationResult {
  try {
    const parsed = JSON.parse(jsonString);

    if (!parsed || typeof parsed !== 'object') {
      return { isValid: false, error: 'Backup file is empty or not a valid JSON object.' };
    }

    // Support direct array of routines
    if (Array.isArray(parsed)) {
      const isValidRoutineList = parsed.every(
        (item) => item && typeof item === 'object' && typeof item.name === 'string' && Array.isArray(item.exercises)
      );
      if (!isValidRoutineList) {
        return { isValid: false, error: 'Invalid routine format: expected an array of routines with exercises.' };
      }
      const exercisesCount = parsed.reduce(
        (acc, r) => acc + (Array.isArray(r.exercises) ? r.exercises.length : 0),
        0
      );
      return {
        isValid: true,
        data: {
          version: DATA_SCHEMA_VERSION,
          exportedAt: Date.now(),
          appName: 'GYM',
          type: 'routines_export',
          routines: parsed,
        },
        summary: {
          routinesCount: parsed.length,
          exercisesCount,
          sessionsCount: 0,
          prsCount: 0,
          customExercisesCount: 0,
        },
      };
    }

    if (typeof parsed.version !== 'number' || parsed.version < 1) {
      return { isValid: false, error: 'Incompatible or missing backup schema version.' };
    }

    if (!Array.isArray(parsed.routines)) {
      return { isValid: false, error: 'Invalid backup structure: missing routines collection.' };
    }

    const exercisesCount = parsed.routines.reduce(
      (acc: number, r: any) => acc + (Array.isArray(r.exercises) ? r.exercises.length : 0),
      0
    );

    return {
      isValid: true,
      data: parsed as GymBackupPayload,
      summary: {
        routinesCount: parsed.routines.length,
        exercisesCount,
        sessionsCount: Array.isArray(parsed.completedSessions) ? parsed.completedSessions.length : 0,
        prsCount: Array.isArray(parsed.personalRecords) ? parsed.personalRecords.length : 0,
        customExercisesCount: Array.isArray(parsed.customExercises) ? parsed.customExercises.length : 0,
      },
    };
  } catch (err: any) {
    return { isValid: false, error: `JSON Parse error: ${err.message || 'Invalid file format'}` };
  }
}

/**
 * Restores validated backup data atomically.
 * Automatically creates a safety snapshot of current data before applying restore.
 */
export async function applyBackupData(payload: GymBackupPayload): Promise<{ success: boolean; safetySnapshotId?: string }> {
  try {
    // 1. Create a Safety Snapshot of CURRENT data before overwriting
    const currentRoutineState = useRoutineStore.getState();
    const currentHistoryState = useHistoryStore.getState();
    const currentExerciseState = useExerciseStore.getState();
    const currentUserState = useUserStore.getState();
    const currentWorkoutState = useWorkoutStore.getState();

    let safetySnapshotId: string | undefined;
    try {
      safetySnapshotId = await snapshotRepository.createSnapshot(
        {
          routines: currentRoutineState.routines,
          completedSessions: currentHistoryState.completedSessions,
          personalRecords: currentHistoryState.personalRecords,
          customExercises: currentExerciseState.exercises.filter((e) => e.isCustom),
          profile: currentUserState.profile,
          preferences: currentUserState.preferences,
          activeSession: currentWorkoutState.activeSession,
        },
        'pre_restore_safety'
      );
    } catch (snapErr) {
      console.warn('[BackupManager] Failed to create pre-restore safety snapshot:', snapErr);
    }

    // 2. Restore User Profile & Preferences
    if (payload.profile) {
      useUserStore.getState().updateProfile(payload.profile);
    }
    if (payload.preferences) {
      useUserStore.getState().updatePreferences(payload.preferences);
    }

    // 3. Restore Routines & Planner Schedule
    if (Array.isArray(payload.routines)) {
      useRoutineStore.setState({
        routines: payload.routines,
        activeRoutineId: payload.routines[0]?.id || '',
      });
      for (const rt of payload.routines) {
        await routineRepository.saveRoutine(rt).catch(console.warn);
      }
    }

    if (payload.weeklySchedule) {
      useRoutineStore.getState().setLoadedPlannerSchedule(payload.weeklySchedule, payload.splitName);
      await routineService.savePlannerSchedule(payload.weeklySchedule, payload.splitName || 'My Routine Planner').catch(console.warn);
    }

    // 4. Restore History & PRs (only if present in payload)
    if (Array.isArray(payload.completedSessions) && payload.completedSessions.length > 0) {
      useHistoryStore.setState({
        completedSessions: payload.completedSessions,
        personalRecords: payload.personalRecords || [],
      });
      for (const wo of payload.completedSessions) {
        await workoutRepository.saveCompletedWorkout(wo).catch(console.warn);
      }
    }

    // 5. Restore Favorites & Custom Exercises
    if (Array.isArray(payload.favorites) && payload.favorites.length > 0) {
      useExerciseStore.setState({
        favorites: payload.favorites,
      });
    }

    if (Array.isArray(payload.customExercises) && payload.customExercises.length > 0) {
      const exerciseStore = useExerciseStore.getState();
      payload.customExercises.forEach((customEx) => {
        exerciseStore.addExercise(customEx);
      });
      for (const ex of payload.customExercises) {
        await exerciseRepository.saveCustomExercise(ex).catch(console.warn);
      }
    }

    // 6. Restore or Clear Active Session (only if specified in payload)
    if (payload.activeSession && payload.activeSession.status === 'in_progress') {
      useWorkoutStore.setState({
        activeSession: payload.activeSession,
      });
      await workoutRepository.saveActiveSession(payload.activeSession);
    } else if (payload.activeSession !== undefined) {
      await workoutRepository.clearActiveSession();
    }

    // 7. Reset sync outbox to clean local baseline without duplicating operations
    try {
      const { syncEngine } = await import('../services/data/sync');
      await syncEngine.reset();
    } catch (syncErr) {
      console.warn('[BackupManager] Error resetting sync outbox after restore:', syncErr);
    }

    return { success: true, safetySnapshotId };
  } catch (err) {
    console.error('[BackupManager] Error restoring backup data:', err);
    throw err;
  }
}
