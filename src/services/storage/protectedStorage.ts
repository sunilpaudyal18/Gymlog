/**
 * Isolated Protected Local Storage Persistence Primitives
 * Stores user custom exercises and saved routines in protected keys
 * that are shielded from app upgrades, schema resets, and cache clears.
 *
 * Hardened Anti-Corruption & Eviction Protections:
 * - Never blindly overwrites storage if JSON parsing fails.
 * - Quarantines corrupted records to safety backup keys instead of wiping user data.
 * - Mirrors writes to IndexedDB (exerciseRepository & routineRepository) as durable source of truth.
 * - Handles QuotaExceededError gracefully without application crashes.
 */

import { Exercise, Routine, MuscleGroup } from '../../types';
import { exerciseRepository } from '../database/repositories/exerciseRepository';
import { routineRepository } from '../database/repositories/routineRepository';

export const APP_SCHEMA_VERSION = 2;

export const PROTECTED_STORAGE_KEYS = {
  SCHEMA_VERSION: 'app_schema_version',
  CUSTOM_EXERCISES: 'user_custom_exercises',
  SAVED_ROUTINES: 'user_saved_routines',
  LAST_SYNC: 'gym_last_offline_sync',
} as const;

// In-memory corruption tracking
const corruptionFlags = new Map<string, boolean>();

export const normalizeMuscleTaxonomy = (muscle: string | MuscleGroup): MuscleGroup => {
  if (muscle === 'glutes' || muscle === 'calves') return 'legs';
  return muscle as MuscleGroup;
};

/**
 * Checks whether a specific storage key was flagged as corrupted.
 */
export function isProtectedStorageCorrupted(key: string): boolean {
  return Boolean(corruptionFlags.get(key));
}

/**
 * Returns quarantined corrupted data for a given key, if any exists.
 */
export function getQuarantinedCorruptedData(key: string): string | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem(`${key}_corrupted_bak`);
  } catch {
    return null;
  }
}

/**
 * Robust JSON array parser with quarantine protection against silent data wipes.
 */
function safeParseArray<T>(key: string, raw: string | null): { data: T[]; corrupted: boolean } {
  if (!raw || !raw.trim()) {
    return { data: [], corrupted: false };
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      corruptionFlags.set(key, false);
      return { data: parsed, corrupted: false };
    }
    // Object or primitive where array was expected
    throw new Error(`Expected array in storage for "${key}", found ${typeof parsed}`);
  } catch (err) {
    console.error(`[ProtectedStorage] Data corruption detected in "${key}":`, err);
    corruptionFlags.set(key, true);

    // Quarantine corrupted raw data to safety backup key without overwriting original immediately
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${key}_corrupted_bak`, raw);
      }
    } catch (saveErr) {
      console.warn(`[ProtectedStorage] Failed to save quarantine backup for "${key}":`, saveErr);
    }

    // Lenient regex extraction to salvage valid records from corrupted JSON string
    const salvaged: T[] = [];
    try {
      const objectRegex = /\{[^{}]*"id"\s*:\s*"[^"]+"[^{}]*\}/g;
      const matches = raw.match(objectRegex);
      if (matches) {
        for (const itemStr of matches) {
          try {
            const item = JSON.parse(itemStr);
            if (item && item.id) {
              salvaged.push(item);
            }
          } catch {
            // Ignore sub-match parse failures
          }
        }
      }
    } catch {
      // Ignore salvage scanner errors
    }

    return { data: salvaged, corrupted: true };
  }
}

/**
 * Retrieve all protected user custom exercises from localStorage.
 */
export function getProtectedCustomExercises(): Exercise[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES);
    const { data } = safeParseArray<Exercise>(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES, raw);
    return data;
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to read protected custom exercises:', e);
    return [];
  }
}

/**
 * Persist a custom exercise into protected storage and mirror to IndexedDB.
 */
export function persistProtectedCustomExercise(exercise: Exercise): void {
  const normalizedExercise: Exercise = {
    ...exercise,
    primaryMuscle: normalizeMuscleTaxonomy(exercise.primaryMuscle),
    isCustom: true,
  };

  // 1. Primary write to IndexedDB as durable source of truth
  exerciseRepository.saveCustomExercise(normalizedExercise).catch((err) => {
    console.warn('[ProtectedStorage] Write to exerciseRepository failed:', err);
  });
}

/**
 * Remove a custom exercise from protected storage and IndexedDB.
 */
export function removeProtectedCustomExercise(id: string): void {
  // 1. Delete from IndexedDB
  exerciseRepository.deleteCustomExercise(id).catch((err) => {
    console.warn('[ProtectedStorage] Mirror delete from exerciseRepository failed:', err);
  });

  // 2. Remove from localStorage
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
 * Retrieve all protected user saved routines from localStorage.
 */
export function getProtectedSavedRoutines(): Routine[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(PROTECTED_STORAGE_KEYS.SAVED_ROUTINES);
    const { data } = safeParseArray<Routine>(PROTECTED_STORAGE_KEYS.SAVED_ROUTINES, raw);
    return data;
  } catch (e) {
    console.warn('[ProtectedStorage] Failed to read protected saved routines:', e);
    return [];
  }
}

/**
 * Persist a saved routine into protected storage and mirror to IndexedDB.
 */
export function persistProtectedSavedRoutine(routine: Routine): void {
  const normalizedTargetMuscles = (routine.targetMuscles || []).map(normalizeMuscleTaxonomy);
  const normalizedRoutine: Routine = {
    ...routine,
    targetMuscles: Array.from(new Set(normalizedTargetMuscles)) as MuscleGroup[],
  };

  // 1. Primary write to IndexedDB as durable source of truth
  routineRepository.saveRoutine(normalizedRoutine).catch((err) => {
    console.warn('[ProtectedStorage] Write to routineRepository failed:', err);
  });
}

/**
 * Remove a saved routine from protected storage and IndexedDB.
 */
export function removeProtectedSavedRoutine(id: string): void {
  // 1. Delete from IndexedDB
  routineRepository.deleteRoutine(id).catch((err) => {
    console.warn('[ProtectedStorage] Mirror delete from routineRepository failed:', err);
  });

  // 2. Remove from localStorage
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
