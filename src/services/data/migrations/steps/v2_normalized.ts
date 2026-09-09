/**
 * Migration Step v2: Data Schema Hardening & Taxonomy Normalization
 * Source Version: 1
 * Target Version: 2
 *
 * Requirements:
 * 1. Normalizes all custom exercises and routines to the unified 8 core muscle groups (glutes/calves -> legs).
 * 2. Enforces explicit 7-day keys (0 through 6) in the weekly planner schedule without altering user assignments.
 * 3. Preserves all unknown/future fields on records via non-destructive object spreads.
 * 4. Verifies record-level integrity via read-back.
 */

import { MuscleGroup, Routine, Exercise } from '../../../../types';
import { DataMigration, MigrationContext } from '../migrationTypes';

const normalizeMuscleGroup = (m: string | MuscleGroup): MuscleGroup => {
  if (m === 'glutes' || m === 'calves') return 'legs';
  return m as MuscleGroup;
};

export const migrationV2Normalized: DataMigration = {
  id: 'v1-to-v2-taxonomy-normalization',
  fromVersion: 1,
  toVersion: 2,
  description: 'Normalizes muscle taxonomy to unified 8 core groups, enforces 7-day schedule keys, and preserves unknown fields',
  isRisky: true,

  async migrate(ctx: MigrationContext) {
    // 1. Normalize Custom Exercises (Preserve unknown fields)
    const customExercises = await ctx.getCustomExercises();
    let exercisesMigrated = 0;
    for (const ex of customExercises) {
      const normalizedMuscle = normalizeMuscleGroup(ex.primaryMuscle);
      if (normalizedMuscle !== ex.primaryMuscle) {
        const updatedEx: Exercise = {
          ...ex,
          primaryMuscle: normalizedMuscle,
        };
        await ctx.saveCustomExercise(updatedEx);
        exercisesMigrated++;
      }
    }

    // 2. Normalize Routines (Preserve unknown fields & exercise order)
    const routines = await ctx.getRoutines();
    let routinesMigrated = 0;
    for (const rt of routines) {
      let changed = false;
      const normalizedTargets = (rt.targetMuscles || []).map(normalizeMuscleGroup);
      const uniqueTargets = Array.from(new Set(normalizedTargets)) as MuscleGroup[];

      const normalizedExercises = (rt.exercises || []).map((ex, idx) => {
        const normExMuscle = normalizeMuscleGroup(ex.muscleGroup);
        if (normExMuscle !== ex.muscleGroup || ex.order !== idx + 1) {
          changed = true;
          return {
            ...ex,
            muscleGroup: normExMuscle,
            order: idx + 1,
          };
        }
        return ex;
      });

      if (changed || uniqueTargets.length !== (rt.targetMuscles || []).length) {
        const updatedRt: Routine = {
          ...rt,
          targetMuscles: uniqueTargets.length > 0 ? uniqueTargets : ['chest'],
          exercises: normalizedExercises,
          updatedAt: Date.now(),
        };
        await ctx.saveRoutine(updatedRt);
        routinesMigrated++;
      }
    }

    // 3. Normalize Weekly Planner Schedule (Enforce complete 7-day keys 0..6)
    let scheduleMigrated = false;
    const scheduleData = await ctx.getPlannerSchedule();
    if (scheduleData && scheduleData.weeklySchedule) {
      const current = scheduleData.weeklySchedule;
      const normalizedSchedule: Record<number, string | null> = {
        0: current[0] ?? null,
        1: current[1] ?? null,
        2: current[2] ?? null,
        3: current[3] ?? null,
        4: current[4] ?? null,
        5: current[5] ?? null,
        6: current[6] ?? null,
      };

      await ctx.savePlannerSchedule(normalizedSchedule, scheduleData.splitName || 'My Routine Planner');
      scheduleMigrated = true;
    }

    return {
      exercisesMigrated,
      routinesMigrated,
      scheduleMigrated,
    };
  },

  async validate(ctx: MigrationContext): Promise<boolean> {
    // 1. Validate exercises
    const exercises = await ctx.getCustomExercises();
    for (const ex of exercises) {
      if (!ex.id || !ex.name) return false;
      if (ex.primaryMuscle === 'glutes' || ex.primaryMuscle === 'calves') return false;
    }

    // 2. Validate routines
    const routines = await ctx.getRoutines();
    for (const rt of routines) {
      if (!rt.id || !rt.name || !Array.isArray(rt.exercises)) return false;
      if (rt.targetMuscles?.some((m) => m === 'glutes' || m === 'calves')) return false;
      for (const ex of rt.exercises) {
        if (ex.muscleGroup === 'glutes' || ex.muscleGroup === 'calves') return false;
      }
    }

    // 3. Validate schedule
    const schedule = await ctx.getPlannerSchedule();
    if (schedule && schedule.weeklySchedule) {
      for (let i = 0; i <= 6; i++) {
        if (!(i in schedule.weeklySchedule)) return false;
      }
    }

    return true;
  },
};
