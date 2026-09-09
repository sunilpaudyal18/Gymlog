/**
 * Migration Step v1: Baseline Local-First Ingestion
 * Source Version: 0 (Unmigrated legacy localStorage)
 * Target Version: 1 (Baseline IndexedDB collections)
 *
 * Ingests legacy localStorage keys into IndexedDB with deduplication and read-back verification.
 */

import { Exercise, Routine, WorkoutSession } from '../../../../types';
import { DataMigration, MigrationContext } from '../migrationTypes';

function safeParseLocalStorageArray<T>(key: string): T[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(key);
    if (!raw || !raw.trim()) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
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

export const migrationV1Baseline: DataMigration = {
  id: 'v0-to-v1-baseline-ingestion',
  fromVersion: 0,
  toVersion: 1,
  description: 'Ingests legacy localStorage collections into IndexedDB durable stores with read-back verification',
  isRisky: false,

  async migrate(ctx: MigrationContext) {
    // 1. Read legacy arrays from localStorage
    const legacyCustomEx = safeParseLocalStorageArray<Exercise>('user_custom_exercises');
    const olderCustomEx = safeParseLocalStorageArray<Exercise>('gym_user_custom_exercises');
    const legacyRoutines = safeParseLocalStorageArray<Routine>('user_saved_routines');
    const legacyHistory = safeParseLocalStorageArray<WorkoutSession>('gym_history_store_v2');

    // Deduplicate exercises
    const exercisesMap = new Map<string, Exercise>();
    [...legacyCustomEx, ...olderCustomEx].forEach((ex) => {
      if (ex && ex.id && (ex.isCustom || !ex.id.startsWith('preset-'))) {
        exercisesMap.set(ex.id, { ...ex, isCustom: true });
      }
    });

    // Deduplicate routines
    const routinesMap = new Map<string, Routine>();
    legacyRoutines.forEach((rt) => {
      if (rt && rt.id) {
        routinesMap.set(rt.id, rt);
      }
    });

    // Deduplicate workouts
    const workoutsMap = new Map<string, WorkoutSession>();
    legacyHistory.forEach((wo) => {
      if (wo && wo.id) {
        workoutsMap.set(wo.id, wo);
      }
    });

    // 2. Read existing IndexedDB records
    const existingEx = await ctx.getCustomExercises();
    const existingRt = await ctx.getRoutines();
    const existingWo = await ctx.getCompletedWorkouts();

    const existingExIds = new Set(existingEx.map((e) => e.id));
    const existingRtIds = new Set(existingRt.map((r) => r.id));
    const existingWoIds = new Set(existingWo.map((w) => w.id));

    // 3. Write missing records
    let exercisesMigrated = 0;
    for (const [id, ex] of exercisesMap.entries()) {
      if (!existingExIds.has(id)) {
        await ctx.saveCustomExercise(ex);
        exercisesMigrated++;
      }
    }

    let routinesMigrated = 0;
    for (const [id, rt] of routinesMap.entries()) {
      if (!existingRtIds.has(id)) {
        await ctx.saveRoutine(rt);
        routinesMigrated++;
      }
    }

    let workoutsMigrated = 0;
    for (const [id, wo] of workoutsMap.entries()) {
      if (!existingWoIds.has(id)) {
        await ctx.saveCompletedWorkout(wo);
        workoutsMigrated++;
      }
    }

    // 4. Ingest weekly schedule if present in legacy gym_routines_store_v2
    let scheduleMigrated = false;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const rawStore = localStorage.getItem('gym_routines_store_v2');
        if (rawStore) {
          const parsed = JSON.parse(rawStore);
          const state = parsed?.state || parsed;
          if (state && state.weeklySchedule) {
            const existingSchedule = await ctx.getPlannerSchedule();
            if (!existingSchedule) {
              await ctx.savePlannerSchedule(
                state.weeklySchedule,
                state.splitName || 'My Routine Planner'
              );
              scheduleMigrated = true;
            }
          }
        }
      }
    } catch (_) {}

    // Maintain legacy marker compatibility
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('storage_migration_v1', 'completed');
    }
    await ctx.kvSet('storage_migration_v1', 'completed');

    return {
      exercisesMigrated,
      routinesMigrated,
      workoutsMigrated,
      scheduleMigrated,
    };
  },

  async validate(ctx: MigrationContext): Promise<boolean> {
    // Read back collections
    const exercises = await ctx.getCustomExercises();
    const routines = await ctx.getRoutines();
    const workouts = await ctx.getCompletedWorkouts();

    // Verify all records have valid structure and IDs
    const validExercises = exercises.every((e) => Boolean(e.id && e.name));
    const validRoutines = routines.every((r) => Boolean(r.id && r.name && Array.isArray(r.exercises)));
    const validWorkouts = workouts.every((w) => Boolean(w.id && Array.isArray(w.exercises)));

    return validExercises && validRoutines && validWorkouts;
  },
};
