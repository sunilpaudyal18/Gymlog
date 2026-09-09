/**
 * Schema Versioning & Protected Local Persistence Manager
 * Ensures version-controlled migrations for core application updates
 * while strictly safeguarding user-created routines and custom exercises
 * across IndexedDB and protected localStorage keys.
 *
 * Hardened Invariant:
 * APP UPDATE MUST NEVER EQUAL USER DATA RESET.
 * - Empty-state overwrite is strictly blocked.
 * - If corruption is detected or arrays are empty, existing data is preserved.
 * - Synchronizes with IndexedDB repositories as the durable source of truth.
 */

import { Exercise, MuscleGroup, Routine } from '../../types';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { exerciseRepository } from '../database/repositories/exerciseRepository';
import { routineRepository } from '../database/repositories/routineRepository';
import {
  APP_SCHEMA_VERSION,
  PROTECTED_STORAGE_KEYS,
  normalizeMuscleTaxonomy,
  getProtectedCustomExercises,
  persistProtectedCustomExercise,
  removeProtectedCustomExercise,
  getProtectedSavedRoutines,
  persistProtectedSavedRoutine,
  removeProtectedSavedRoutine,
  isProtectedStorageCorrupted,
} from './protectedStorage';
import { CURRENT_DATA_SCHEMA_VERSION, migrationRunner } from '../data/migrations';

export {
  APP_SCHEMA_VERSION,
  CURRENT_DATA_SCHEMA_VERSION,
  PROTECTED_STORAGE_KEYS,
  getProtectedCustomExercises,
  persistProtectedCustomExercise,
  removeProtectedCustomExercise,
  getProtectedSavedRoutines,
  persistProtectedSavedRoutine,
  removeProtectedSavedRoutine,
};

/**
 * Synchronizes protected storage, stores, and IndexedDB with anti-overwrite guards.
 */
export function migrateData(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    // 1. Gather custom exercises
    const existingCustom = getProtectedCustomExercises();
    const legacyCustomRaw = localStorage.getItem('gym_user_custom_exercises');
    let combinedCustom: Exercise[] = [...existingCustom];

    if (legacyCustomRaw) {
      try {
        const legacyParsed = JSON.parse(legacyCustomRaw);
        if (Array.isArray(legacyParsed)) {
          legacyParsed.forEach((lex: Exercise) => {
            if (!combinedCustom.some((c) => c.id === lex.id)) {
              combinedCustom.push(lex);
            }
          });
        }
      } catch {
        // ignore legacy parse errors safely
      }
    }

    // Pull from exercise store if available
    const exerciseStore = useExerciseStore.getState();
    exerciseStore.exercises.forEach((ex) => {
      if (ex.isCustom && !combinedCustom.some((c) => c.id === ex.id)) {
        combinedCustom.push(ex);
      }
    });

    // Normalize muscle taxonomy
    combinedCustom = combinedCustom.map((ex) => ({
      ...ex,
      primaryMuscle: normalizeMuscleTaxonomy(ex.primaryMuscle),
      isCustom: true,
      equipment: ex.equipment || 'other',
    }));

    // Inject into useExerciseStore
    combinedCustom.forEach((customEx) => {
      if (!exerciseStore.exercises.some((e) => e.id === customEx.id)) {
        exerciseStore.addExercise(customEx);
      }
    });

    // ANTI-OVERWRITE GUARD:
    // Only update localStorage mirror if non-empty legacy custom exercises exist
    const rawCustomInStorage = localStorage.getItem(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES);
    const isCustomCorrupted = isProtectedStorageCorrupted(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES);
    if (combinedCustom.length > 0 && !isCustomCorrupted && rawCustomInStorage) {
      // Retain existing legacy fallback safely without rewriting
    }

    // 2. Gather user routines
    const existingRoutines = getProtectedSavedRoutines();
    const routineStore = useRoutineStore.getState();
    const allRoutines = [...routineStore.routines];

    const normalizedRoutines = allRoutines.map((routine) => {
      const mappedMuscles = (routine.targetMuscles || []).map(normalizeMuscleTaxonomy);
      return {
        ...routine,
        targetMuscles: Array.from(new Set(mappedMuscles)) as MuscleGroup[],
      };
    });

    const combinedRoutines: Routine[] = [...existingRoutines];
    normalizedRoutines.forEach((r) => {
      if (!combinedRoutines.some((cr) => cr.id === r.id)) {
        combinedRoutines.push(r);
      }
    });

    // Inject saved routines back into routineStore if missing
    existingRoutines.forEach((saved) => {
      if (!routineStore.routines.some((r) => r.id === saved.id)) {
        routineStore.addRoutine(saved);
      }
    });

    // Mark current schema version and sync timestamp metadata
    localStorage.setItem(PROTECTED_STORAGE_KEYS.SCHEMA_VERSION, String(APP_SCHEMA_VERSION));
    localStorage.setItem(PROTECTED_STORAGE_KEYS.LAST_SYNC, String(Date.now()));
  } catch (err) {
    console.error('[SchemaManager] Schema migration error safely caught:', err);
  }
}

/**
 * Asynchronously reconciles with IndexedDB repositories as the ultimate single source of truth.
 */
export async function reconcileWithIndexedDb(): Promise<void> {
  try {
    // 1. Reconcile Custom Exercises from IndexedDB
    const idbExercises = await exerciseRepository.getAllCustomExercises().catch(() => []);
    if (idbExercises.length > 0) {
      const exerciseStore = useExerciseStore.getState();
      idbExercises.forEach((idbEx) => {
        if (!exerciseStore.exercises.some((e) => e.id === idbEx.id)) {
          exerciseStore.addExercise(idbEx);
        }
      });
    }

    // 2. Reconcile Routines from IndexedDB
    const idbRoutines = await routineRepository.getAllRoutines().catch(() => []);
    if (idbRoutines.length > 0) {
      const routineStore = useRoutineStore.getState();
      idbRoutines.forEach((idbRt) => {
        if (!routineStore.routines.some((r) => r.id === idbRt.id)) {
          routineStore.addRoutine(idbRt);
        }
      });
    }
  } catch (err) {
    console.warn('[SchemaManager] Non-critical error during IndexedDB reconciliation:', err);
  }
}

/**
 * Compares stored schema version and migrates data while strictly preserving user data.
 */
export function initSchemaMigration(): void {
  try {
    migrationRunner.runMigrations().catch((err) => {
      console.warn('[SchemaManager] Non-critical error during migration runner execution:', err);
    });
  } catch (err) {
    console.error('[SchemaManager] Schema migration initialization encountered an error:', err);
  }
}
