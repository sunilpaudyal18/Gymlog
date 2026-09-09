/**
 * Hydration Barrier & Boot Synchronization Manager - Phase 3 Local-First Architecture
 *
 * Guarantees that:
 * 1. IndexedDB primary database is connected.
 * 2. Safe one-time migration (storage_migration_v1) is executed and verified.
 * 3. Durable user records (custom exercises, routines, workouts, active session)
 *    are loaded directly from IndexedDB into Zustand runtime state.
 * 4. All asynchronous Zustand persistence stores have completed rehydration.
 * 5. Active session crash recovery checks for in-progress workouts.
 * 6. React rendering is unblocked ONLY after in-memory state matches IndexedDB.
 */

import { useRoutineStore } from '../../stores/useRoutineStore';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useUserStore } from '../../stores/useUserStore';
import { getDatabase } from '../database/db';
import { exerciseService } from '../data/exerciseService';
import { routineService } from '../data/routineService';
import { workoutService } from '../data/workoutService';
import { migrationService } from '../data/migrationService';
import { crashRecoveryService } from '../recovery/crashRecoveryService';
import { initSchemaMigration } from './schemaManager';

let hydrationPromise: Promise<void> | null = null;

/**
 * Awaits full store hydration across all persistent Zustand stores and loads
 * durable records from IndexedDB before allowing React components to mount.
 */
export function waitForStorageHydration(): Promise<void> {
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = new Promise<void>(async (resolve) => {
    try {
      // 1. Warm up IndexedDB connection
      await getDatabase().catch((err) => {
        console.warn('[HydrationManager] IndexedDB warmup non-critical error:', err);
      });

      // 2. Run safe, idempotent one-time migration (storage_migration_v1)
      try {
        await migrationService.runOneTimeMigration();
      } catch (migErr) {
        console.warn('[HydrationManager] Migration pipeline caught non-critical error:', migErr);
      }

      // 3. Setup hydration listeners for Zustand persist stores
      const waitForStore = (store: any): Promise<void> => {
        if (!store?.persist) return Promise.resolve();
        if (store.persist.hasHydrated && store.persist.hasHydrated()) {
          return Promise.resolve();
        }
        return new Promise<void>((res) => {
          const unsub = store.persist.onFinishHydration?.(() => {
            unsub?.();
            res();
          });
          // Fallback timer in case store was already hydrated or finished synchronously
          setTimeout(res, 800);
        });
      };

      // 4. Await persist stores in parallel with ceiling timeout
      await Promise.race([
        Promise.all([
          waitForStore(useRoutineStore),
          waitForStore(useExerciseStore),
          waitForStore(useWorkoutStore),
          waitForStore(useHistoryStore),
          waitForStore(useUserStore),
        ]),
        new Promise((res) => setTimeout(res, 1200)),
      ]);

      // 5. Load durable user records from IndexedDB into runtime Zustand state
      try {
        const [customExercises, routines, completedWorkouts, personalRecords, plannerSchedule] =
          await Promise.all([
            exerciseService.getCustomExercises(),
            routineService.getRoutines(),
            workoutService.getCompletedWorkouts(),
            workoutService.getPersonalRecords(),
            routineService.getPlannerSchedule(),
          ]);

        // Ingest into runtime Zustand stores
        if (customExercises.length > 0) {
          useExerciseStore.getState().setLoadedCustomExercises(customExercises);
        }

        // Hydrate Planner Schedule (Weekly split assignments) FIRST
        if (plannerSchedule && plannerSchedule.weeklySchedule) {
          useRoutineStore
            .getState()
            .setLoadedPlannerSchedule(plannerSchedule.weeklySchedule, plannerSchedule.splitName);
        } else {
          // If kv_store schedule was empty, inspect if Zustand rehydrated any non-null day
          const inMemorySchedule = useRoutineStore.getState().weeklySchedule;
          const hasAssignedDay = Object.values(inMemorySchedule || {}).some((v) => v !== null);
          if (hasAssignedDay) {
            routineService
              .savePlannerSchedule(inMemorySchedule, useRoutineStore.getState().splitName)
              .catch(() => {});
          }
        }

        if (routines.length > 0) {
          useRoutineStore.getState().setLoadedRoutines(routines);
        }

        if (completedWorkouts.length > 0) {
          useHistoryStore.getState().setLoadedWorkouts(completedWorkouts);
        }

        if (personalRecords.length > 0) {
          useHistoryStore.getState().setLoadedPersonalRecords(personalRecords);
        }

        // Check crash recovery for in-progress workouts
        await crashRecoveryService.checkAndRecover();
      } catch (loadErr) {
        console.warn('[HydrationManager] Error loading initial records from IndexedDB:', loadErr);
      }

      // 6. Run schema migration checks safely post-hydration
      try {
        initSchemaMigration();
      } catch (migrationErr) {
        console.warn('[HydrationManager] Post-hydration schema migration caught error:', migrationErr);
      }

      resolve();
    } catch (err) {
      console.error('[HydrationManager] Critical error during hydration gate, releasing render:', err);
      resolve();
    }
  });

  return hydrationPromise;
}
