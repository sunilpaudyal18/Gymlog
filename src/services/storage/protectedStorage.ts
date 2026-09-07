/**
 * Isolated Protected Local Storage Persistence Primitives
 * Stores user custom exercises and saved routines in protected keys
 * that are shielded from app upgrades, schema resets, and cache clears.
 */

import { Exercise, Routine, MuscleGroup } from '../../types';

export const APP_SCHEMA_VERSION = 2;

export const PROTECTED_STORAGE_KEYS = {
  SCHEMA_VERSION: 'app_schema_version',
  CUSTOM_EXERCISES: 'user_custom_exercises',
  SAVED_ROUTINES: 'user_saved_routines',
  LAST_SYNC: 'gym_last_offline_sync',
} as const;

export const normalizeMuscleTaxonomy = (muscle: string | MuscleGroup): MuscleGroup => {
  if (muscle === 'glutes' || muscle === 'calves') return 'legs';
  return muscle as MuscleGroup;
};

/**
 * Retrieve all protected user custom exercises from localStorage
 */
export function getProtectedCustomExercises(): Exercise[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to read protected custom exercises:', e);
    return [];
  }
}

/**
 * Persist a custom exercise into protected storage
 */
export function persistProtectedCustomExercise(exercise: Exercise): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getProtectedCustomExercises();
    const updated = [
      {
        ...exercise,
        primaryMuscle: normalizeMuscleTaxonomy(exercise.primaryMuscle),
        isCustom: true,
      },
      ...current.filter((e) => e.id !== exercise.id),
    ];
    localStorage.setItem(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
    localStorage.setItem(PROTECTED_STORAGE_KEYS.LAST_SYNC, String(Date.now()));
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to persist protected custom exercise:', e);
  }
}

/**
 * Remove a custom exercise from protected storage
 */
export function removeProtectedCustomExercise(id: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getProtectedCustomExercises();
    const updated = current.filter((e) => e.id !== id);
    localStorage.setItem(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(updated));
    localStorage.setItem(PROTECTED_STORAGE_KEYS.LAST_SYNC, String(Date.now()));
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to remove protected custom exercise:', e);
  }
}

/**
 * Retrieve all protected user saved routines from localStorage
 */
export function getProtectedSavedRoutines(): Routine[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(PROTECTED_STORAGE_KEYS.SAVED_ROUTINES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to read protected saved routines:', e);
    return [];
  }
}

/**
 * Persist a saved routine into protected storage
 */
export function persistProtectedSavedRoutine(routine: Routine): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getProtectedSavedRoutines();
    const normalizedTargetMuscles = (routine.targetMuscles || []).map(normalizeMuscleTaxonomy);
    const normalizedRoutine: Routine = {
      ...routine,
      targetMuscles: Array.from(new Set(normalizedTargetMuscles)) as MuscleGroup[],
    };
    const updated = [normalizedRoutine, ...current.filter((r) => r.id !== routine.id)];
    localStorage.setItem(PROTECTED_STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(updated));
    localStorage.setItem(PROTECTED_STORAGE_KEYS.LAST_SYNC, String(Date.now()));
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to persist protected saved routine:', e);
  }
}

/**
 * Remove a saved routine from protected storage
 */
export function removeProtectedSavedRoutine(id: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const current = getProtectedSavedRoutines();
    const updated = current.filter((r) => r.id !== id);
    localStorage.setItem(PROTECTED_STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(updated));
    localStorage.setItem(PROTECTED_STORAGE_KEYS.LAST_SYNC, String(Date.now()));
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to remove protected saved routine:', e);
  }
}
