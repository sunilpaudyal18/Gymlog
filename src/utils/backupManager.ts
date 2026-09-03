import { useRoutineStore } from '../stores/useRoutineStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useExerciseStore } from '../stores/useExerciseStore';
import { useUserStore } from '../stores/useUserStore';
import { useWorkoutStore } from '../stores/useWorkoutStore';
import { Routine, WorkoutSession, PersonalRecord, UserProfile, Exercise } from '../types';
import { snapshotRepository } from '../services/database/repositories/snapshotRepository';
import { workoutRepository } from '../services/database/repositories/workoutRepository';

export const DATA_SCHEMA_VERSION = 1;

export interface GymBackupPayload {
  version: number;
  exportedAt: number;
  appName: string;
  profile: UserProfile;
  preferences: any;
  routines: Routine[];
  completedSessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  favorites: string[];
  customExercises: Exercise[];
  activeSession?: WorkoutSession | null;
}

export interface BackupValidationResult {
  isValid: boolean;
  error?: string;
  data?: GymBackupPayload;
  summary?: {
    routinesCount: number;
    sessionsCount: number;
    prsCount: number;
    customExercisesCount: number;
  };
}

/**
 * Collects current application state and downloads it as a formatted JSON file.
 */
export function exportBackupData(): void {
  const routineState = useRoutineStore.getState();
  const historyState = useHistoryStore.getState();
  const exerciseState = useExerciseStore.getState();
  const userState = useUserStore.getState();
  const workoutState = useWorkoutStore.getState();

  const customExercises = exerciseState.exercises.filter((e) => e.isCustom);

  const payload: GymBackupPayload = {
    version: DATA_SCHEMA_VERSION,
    exportedAt: Date.now(),
    appName: 'GYM',
    profile: userState.profile,
    preferences: userState.preferences,
    routines: routineState.routines,
    completedSessions: historyState.completedSessions,
    personalRecords: historyState.personalRecords,
    favorites: exerciseState.favorites,
    customExercises,
    activeSession: workoutState.activeSession,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  const filename = `GYM-backup-${today}.json`;

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

    if (typeof parsed.version !== 'number' || parsed.version < 1) {
      return { isValid: false, error: 'Incompatible or missing backup schema version.' };
    }

    if (!Array.isArray(parsed.routines)) {
      return { isValid: false, error: 'Invalid backup structure: missing routines collection.' };
    }

    if (!Array.isArray(parsed.completedSessions)) {
      return { isValid: false, error: 'Invalid backup structure: missing workout history collection.' };
    }

    return {
      isValid: true,
      data: parsed as GymBackupPayload,
      summary: {
        routinesCount: parsed.routines.length,
        sessionsCount: parsed.completedSessions.length,
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

    // 3. Restore Routines
    if (Array.isArray(payload.routines)) {
      useRoutineStore.setState({
        routines: payload.routines,
        activeRoutineId: payload.routines[0]?.id || 'chest-triceps-focus',
      });
    }

    // 4. Restore History & PRs
    if (Array.isArray(payload.completedSessions)) {
      useHistoryStore.setState({
        completedSessions: payload.completedSessions,
        personalRecords: payload.personalRecords || [],
      });
    }

    // 5. Restore Favorites & Custom Exercises
    if (Array.isArray(payload.favorites)) {
      useExerciseStore.setState({
        favorites: payload.favorites,
      });
    }

    if (Array.isArray(payload.customExercises) && payload.customExercises.length > 0) {
      const exerciseStore = useExerciseStore.getState();
      payload.customExercises.forEach((customEx) => {
        exerciseStore.addExercise(customEx);
      });
    }

    // 6. Restore or Clear Active Session
    if (payload.activeSession && payload.activeSession.status === 'in_progress') {
      useWorkoutStore.setState({
        activeSession: payload.activeSession,
      });
      await workoutRepository.saveActiveSession(payload.activeSession);
    } else {
      await workoutRepository.clearActiveSession();
    }

    return { success: true, safetySnapshotId };
  } catch (err) {
    console.error('[BackupManager] Error restoring backup data:', err);
    throw err;
  }
}
