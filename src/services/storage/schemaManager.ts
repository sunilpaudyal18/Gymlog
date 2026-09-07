/**
 * Schema Versioning & Protected Local Persistence Manager
 * Ensures version-controlled migrations for core application updates
 * while strictly safeguarding user-created routines and custom exercises
 * in isolated, protected localStorage keys.
 */

import { Exercise, MuscleGroup } from '../../types';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
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
} from './protectedStorage';

export {
  APP_SCHEMA_VERSION,
  PROTECTED_STORAGE_KEYS,
  getProtectedCustomExercises,
  persistProtectedCustomExercise,
  removeProtectedCustomExercise,
  getProtectedSavedRoutines,
  persistProtectedSavedRoutine,
  removeProtectedSavedRoutine,
};

/**
 * Executes schema migration & sync between protected storage and stores.
 */
export function migrateData(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    // Gather existing custom exercises from protected key and legacy keys
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
        // ignore legacy parse errors
      }
    }

    // Normalize muscle taxonomy (Glutes -> Legs) on all custom exercises
    combinedCustom = combinedCustom.map((ex) => ({
      ...ex,
      primaryMuscle: normalizeMuscleTaxonomy(ex.primaryMuscle),
      isCustom: true,
      equipment: ex.equipment || 'other',
    }));

    // Ensure all custom exercises are injected into useExerciseStore
    const exerciseStore = useExerciseStore.getState();
    combinedCustom.forEach((customEx) => {
      if (!exerciseStore.exercises.some((e) => e.id === customEx.id)) {
        exerciseStore.addExercise(customEx);
      }
    });

    // Save consolidated custom exercises into protected storage key
    localStorage.setItem(PROTECTED_STORAGE_KEYS.CUSTOM_EXERCISES, JSON.stringify(combinedCustom));

    // Gather user routines from protected key and store
    const existingRoutines = getProtectedSavedRoutines();
    const routineStore = useRoutineStore.getState();
    const allRoutines = [...routineStore.routines];

    // Normalize target muscles on routines (Glutes -> Legs, deduplicating)
    const normalizedRoutines = allRoutines.map((routine) => {
      const mappedMuscles = (routine.targetMuscles || []).map(normalizeMuscleTaxonomy);
      return {
        ...routine,
        targetMuscles: Array.from(new Set(mappedMuscles)) as MuscleGroup[],
      };
    });

    // Save into protected storage key
    const combinedRoutines = [...existingRoutines];
    normalizedRoutines.forEach((r) => {
      if (!combinedRoutines.some((cr) => cr.id === r.id)) {
        combinedRoutines.push(r);
      }
    });
    localStorage.setItem(PROTECTED_STORAGE_KEYS.SAVED_ROUTINES, JSON.stringify(combinedRoutines));

    // Also inject any protected saved routines back into routineStore if missing
    existingRoutines.forEach((saved) => {
      if (!routineStore.routines.some((r) => r.id === saved.id)) {
        routineStore.addRoutine(saved);
      }
    });

    // Mark current schema version
    localStorage.setItem(PROTECTED_STORAGE_KEYS.SCHEMA_VERSION, String(APP_SCHEMA_VERSION));
    localStorage.setItem(PROTECTED_STORAGE_KEYS.LAST_SYNC, String(Date.now()));
  } catch (err) {
    console.error('[SchemaManager] Schema migration error:', err);
  }
}

/**
 * Compares stored schema version and migrates data while strictly preserving user data.
 */
export function initSchemaMigration(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

    const storedVersionStr = localStorage.getItem(PROTECTED_STORAGE_KEYS.SCHEMA_VERSION);
    const storedVersion = storedVersionStr ? parseInt(storedVersionStr, 10) : 0;

    console.log(`[SchemaManager] Checking schema version: current=${storedVersion}, target=${APP_SCHEMA_VERSION}`);

    // Run initial migration immediately
    migrateData();

    // Re-verify migration whenever stores finish hydration from IndexedDB
    if (useExerciseStore.persist?.onFinishHydration) {
      useExerciseStore.persist.onFinishHydration(() => {
        console.log('[SchemaManager] Exercise store hydrated. Synchronizing protected custom exercises...');
        migrateData();
      });
    }

    if (useRoutineStore.persist?.onFinishHydration) {
      useRoutineStore.persist.onFinishHydration(() => {
        console.log('[SchemaManager] Routine store hydrated. Synchronizing protected saved routines...');
        migrateData();
      });
    }

    console.log(`[SchemaManager] Migration to schema v${APP_SCHEMA_VERSION} initialized.`);
  } catch (err) {
    console.error('[SchemaManager] Schema migration encountered an error:', err);
  }
}
