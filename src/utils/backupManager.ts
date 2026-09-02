import { useRoutineStore } from '../stores/useRoutineStore';
import { useHistoryStore } from '../stores/useHistoryStore';
import { useExerciseStore } from '../stores/useExerciseStore';
import { useUserStore } from '../stores/useUserStore';
import { Routine, WorkoutSession, PersonalRecord, UserProfile, Exercise } from '../types';

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

  const customExercises = exerciseState.exercises.filter((e) => e.isCustom);

  const payload: GymBackupPayload = {
    version: DATA_SCHEMA_VERSION,
    exportedAt: Date.now(),
    appName: 'GYM - Kinetic Workout Companion',
    profile: userState.profile,
    preferences: userState.preferences,
    routines: routineState.routines,
    completedSessions: historyState.completedSessions,
    personalRecords: historyState.personalRecords,
    favorites: exerciseState.favorites,
    customExercises,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const today = new Date().toISOString().split('T')[0];
  const filename = `gym-backup-${today}.json`;

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
 * Restores validated backup data into active Zustand stores.
 */
export function applyBackupData(payload: GymBackupPayload): void {
  // 1. Restore User Profile & Preferences
  if (payload.profile) {
    useUserStore.getState().updateProfile(payload.profile);
  }
  if (payload.preferences) {
    useUserStore.getState().updatePreferences(payload.preferences);
  }

  // 2. Restore Routines
  if (Array.isArray(payload.routines)) {
    useRoutineStore.setState({
      routines: payload.routines,
      activeRoutineId: payload.routines[0]?.id || 'chest-triceps-focus',
    });
  }

  // 3. Restore History & PRs
  if (Array.isArray(payload.completedSessions)) {
    useHistoryStore.setState({
      completedSessions: payload.completedSessions,
      personalRecords: payload.personalRecords || [],
    });
  }

  // 4. Restore Favorites & Custom Exercises
  if (Array.isArray(payload.favorites)) {
    useExerciseStore.setState((state) => ({
      favorites: payload.favorites,
    }));
  }

  if (Array.isArray(payload.customExercises) && payload.customExercises.length > 0) {
    const exerciseStore = useExerciseStore.getState();
    payload.customExercises.forEach((customEx) => {
      exerciseStore.addExercise(customEx);
    });
  }
}
