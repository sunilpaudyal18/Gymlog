/**
 * Storage Migration Service - Phase 3 IndexedDB Decoupling
 *
 * Implements safe, one-time, idempotent migration:
 * 1. Reads legacy localStorage keys (user_custom_exercises, user_saved_routines, gym_history_store_v2, etc.)
 * 2. Validates structure and records
 * 3. Reads current IndexedDB state
 * 4. Merges without duplicates using stable ID keys
 * 5. Writes missing records into IndexedDB
 * 6. Reads back and verifies that all expected IDs are present in IndexedDB
 * 7. Sets the versioned marker `storage_migration_v1` ONLY upon confirmed verification
 * 8. Retains legacy localStorage data as a temporary recovery fallback (NEVER deletes immediately)
 */

import { Exercise, Routine, WorkoutSession } from '../../types';
import { exerciseRepository } from '../database/repositories/exerciseRepository';
import { routineRepository } from '../database/repositories/routineRepository';
import { workoutRepository } from '../database/repositories/workoutRepository';
import { routineService } from './routineService';
import { kvGet, kvSet } from '../database/db';

export const MIGRATION_MARKER = 'storage_migration_v1';

export interface MigrationResult {
  migrated: boolean;
  exercisesMigrated: number;
  routinesMigrated: number;
  workoutsMigrated: number;
  verified: boolean;
  error?: string;
}

/**
 * Safely parses an array from localStorage without throwing.
 */
function safeParseLocalStorageArray<T>(key: string): T[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(key);
    if (!raw || !raw.trim()) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    // Zustand persist envelope: { state: { ... } }
    if (parsed && typeof parsed === 'object' && parsed.state) {
      if (Array.isArray(parsed.state.exercises)) return parsed.state.exercises;
      if (Array.isArray(parsed.state.routines)) return parsed.state.routines;
      if (Array.isArray(parsed.state.completedSessions)) return parsed.state.completedSessions;
    }
    return [];
  } catch {
    return [];
  }
}

export const migrationService = {
  /**
   * Checks whether the one-time migration has already been executed and verified.
   */
  async isMigrationComplete(): Promise<boolean> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (localStorage.getItem(MIGRATION_MARKER) === 'completed') {
          return true;
        }
      }
      const dbMarker = await kvGet<string>(MIGRATION_MARKER);
      return dbMarker === 'completed';
    } catch {
      return false;
    }
  },

  /**
   * Runs the idempotent, verified migration from localStorage to IndexedDB.
   */
  async runOneTimeMigration(): Promise<MigrationResult> {
    if (await this.isMigrationComplete()) {
      return {
        migrated: false,
        exercisesMigrated: 0,
        routinesMigrated: 0,
        workoutsMigrated: 0,
        verified: true,
      };
    }

    console.info('[MigrationService] Initiating Phase 3 IndexedDB migration (storage_migration_v1)...');

    try {
      // 1. READ & VALIDATE LOCALSTORAGE SOURCE DATA
      const legacyCustomEx = safeParseLocalStorageArray<Exercise>('user_custom_exercises');
      const olderLegacyCustomEx = safeParseLocalStorageArray<Exercise>('gym_user_custom_exercises');
      const legacyRoutines = safeParseLocalStorageArray<Routine>('user_saved_routines');
      const legacyHistoryParsed = safeParseLocalStorageArray<WorkoutSession>('gym_history_store_v2');

      // Deduplicate source custom exercises
      const sourceExercisesMap = new Map<string, Exercise>();
      [...legacyCustomEx, ...olderLegacyCustomEx].forEach((ex) => {
        if (ex && ex.id && (ex.isCustom || !ex.id.startsWith('preset-'))) {
          sourceExercisesMap.set(ex.id, { ...ex, isCustom: true });
        }
      });

      // Deduplicate source routines (filter out any preset copies if needed)
      const sourceRoutinesMap = new Map<string, Routine>();
      legacyRoutines.forEach((rt) => {
        if (rt && rt.id) {
          sourceRoutinesMap.set(rt.id, rt);
        }
      });

      // Deduplicate source workouts
      const sourceWorkoutsMap = new Map<string, WorkoutSession>();
      legacyHistoryParsed.forEach((wo) => {
        if (wo && wo.id) {
          sourceWorkoutsMap.set(wo.id, wo);
        }
      });

      // 2. READ EXISTING INDEXEDDB STATE
      const existingIdbExercises = await exerciseRepository.getAllCustomExercises().catch(() => []);
      const existingIdbRoutines = await routineRepository.getAllRoutines().catch(() => []);
      const existingIdbWorkouts = await workoutRepository.getAllCompletedWorkouts().catch(() => []);

      const existingExerciseIds = new Set(existingIdbExercises.map((e) => e.id));
      const existingRoutineIds = new Set(existingIdbRoutines.map((r) => r.id));
      const existingWorkoutIds = new Set(existingIdbWorkouts.map((w) => w.id));

      // 3. IDENTIFY MISSING RECORDS (IDEMPOTENT MERGE)
      const exercisesToWrite: Exercise[] = [];
      sourceExercisesMap.forEach((ex, id) => {
        if (!existingExerciseIds.has(id)) {
          exercisesToWrite.push(ex);
        }
      });

      const routinesToWrite: Routine[] = [];
      sourceRoutinesMap.forEach((rt, id) => {
        if (!existingRoutineIds.has(id)) {
          routinesToWrite.push(rt);
        }
      });

      const workoutsToWrite: WorkoutSession[] = [];
      sourceWorkoutsMap.forEach((wo, id) => {
        if (!existingWorkoutIds.has(id)) {
          workoutsToWrite.push(wo);
        }
      });

      // 4. WRITE MISSING RECORDS TO INDEXEDDB
      for (const ex of exercisesToWrite) {
        await exerciseRepository.saveCustomExercise(ex);
      }

      for (const rt of routinesToWrite) {
        await routineRepository.saveRoutine(rt);
      }

      for (const wo of workoutsToWrite) {
        await workoutRepository.saveCompletedWorkout(wo);
      }

      // Migrate legacy weekly schedule from gym_routines_store_v2 if present
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const rawStore = localStorage.getItem('gym_routines_store_v2');
          if (rawStore) {
            const parsed = JSON.parse(rawStore);
            const state = parsed?.state || parsed;
            if (state && state.weeklySchedule) {
              const currentSchedule = await routineService.getPlannerSchedule();
              if (!currentSchedule) {
                await routineService.savePlannerSchedule(
                  state.weeklySchedule,
                  state.splitName || 'My Routine Planner'
                );
              }
            }
          }
        }
      } catch (schErr) {
        console.warn('[MigrationService] Non-critical error migrating legacy schedule:', schErr);
      }

      // 5. READ-BACK & VERIFY
      const verifiedExercises = await exerciseRepository.getAllCustomExercises();
      const verifiedRoutines = await routineRepository.getAllRoutines();
      const verifiedWorkouts = await workoutRepository.getAllCompletedWorkouts();

      const verifiedExIds = new Set(verifiedExercises.map((e) => e.id));
      const verifiedRtIds = new Set(verifiedRoutines.map((r) => r.id));
      const verifiedWoIds = new Set(verifiedWorkouts.map((w) => w.id));

      // Ensure every source ID is present in IndexedDB
      let verificationPassed = true;
      sourceExercisesMap.forEach((_, id) => {
        if (!verifiedExIds.has(id)) verificationPassed = false;
      });
      sourceRoutinesMap.forEach((_, id) => {
        if (!verifiedRtIds.has(id)) verificationPassed = false;
      });
      sourceWorkoutsMap.forEach((_, id) => {
        if (!verifiedWoIds.has(id)) verificationPassed = false;
      });

      if (!verificationPassed) {
        throw new Error('Read-back verification failed: Not all records verified in IndexedDB.');
      }

      // 6. SET VERSIONED MIGRATION MARKER ONLY AFTER VERIFIED SUCCESS
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(MIGRATION_MARKER, 'completed');
      }
      await kvSet(MIGRATION_MARKER, 'completed').catch(() => {});

      console.info(
        `[MigrationService] Phase 3 migration verified successfully. Migrated: ${exercisesToWrite.length} exercises, ${routinesToWrite.length} routines, ${workoutsToWrite.length} workouts.`
      );

      return {
        migrated: true,
        exercisesMigrated: exercisesToWrite.length,
        routinesMigrated: routinesToWrite.length,
        workoutsMigrated: workoutsToWrite.length,
        verified: true,
      };
    } catch (err: any) {
      console.error('[MigrationService] Migration failed. Marker NOT set. Data safely retained:', err);
      return {
        migrated: false,
        exercisesMigrated: 0,
        routinesMigrated: 0,
        workoutsMigrated: 0,
        verified: false,
        error: err?.message || String(err),
      };
    }
  },
};
