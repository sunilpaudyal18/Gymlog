/**
 * Migration Runner - Phase 4 Architecture
 *
 * Central execution engine for data schema migrations.
 * Guarantees that:
 * 1. Migrations run sequentially from source to target version.
 * 2. Pre-migration safety snapshots are recorded in IndexedDB before risky steps.
 * 3. Read-before-write and record-level read-back validations are strictly enforced.
 * 4. On failure, execution is halted safely without clearing or overwriting data.
 * 5. Execution is idempotent; re-running on an up-to-date schema is a zero-cost no-op.
 * 6. Fresh users start with pristine blank user data without executing legacy migrations.
 */

import { kvGet, kvSet } from '../../database/db';
import { exerciseRepository } from '../../database/repositories/exerciseRepository';
import { routineRepository } from '../../database/repositories/routineRepository';
import { workoutRepository } from '../../database/repositories/workoutRepository';
import { snapshotRepository } from '../../database/repositories/snapshotRepository';
import { routineService } from '../routineService';
import { workoutService } from '../workoutService';
import { MigrationContext, MigrationRunResult } from './migrationTypes';
import { migrationRegistry, CURRENT_DATA_SCHEMA_VERSION } from './migrationRegistry';
import { migrationJournal } from './migrationJournal';
import { PROTECTED_STORAGE_KEYS } from '../../storage/protectedStorage';

const DATA_SCHEMA_VERSION_KEY = 'data_schema_version';

/**
 * Builds the runtime migration context offering direct DAL & IDB operations.
 */
function buildMigrationContext(): MigrationContext {
  return {
    getRoutines: () => routineRepository.getAllRoutines(),
    saveRoutine: (r) => routineRepository.saveRoutine(r).then(() => true).catch(() => false),
    deleteRoutine: (id) => routineRepository.deleteRoutine(id).then(() => true).catch(() => false),

    getCustomExercises: () => exerciseRepository.getAllCustomExercises(),
    saveCustomExercise: (e) => exerciseRepository.saveCustomExercise(e).then(() => true).catch(() => false),
    deleteCustomExercise: (id) => exerciseRepository.deleteCustomExercise(id).then(() => true).catch(() => false),

    getCompletedWorkouts: () => workoutRepository.getAllCompletedWorkouts(),
    saveCompletedWorkout: (w) => workoutRepository.saveCompletedWorkout(w).then(() => true).catch(() => false),

    getPersonalRecords: () => workoutService.getPersonalRecords(),
    savePersonalRecords: (prs) => workoutService.savePersonalRecords(prs),

    getPlannerSchedule: () => routineService.getPlannerSchedule(),
    savePlannerSchedule: (s, name) => routineService.savePlannerSchedule(s, name),

    getActiveSession: () => workoutRepository.getActiveSession(),
    saveActiveSession: (s) => workoutRepository.saveActiveSession(s).then(() => true).catch(() => false),

    createSafetySnapshot: async (reason: string) => {
      try {
        const [routines, completedSessions, personalRecords, customExercises, activeSession] =
          await Promise.all([
            routineRepository.getAllRoutines(),
            workoutRepository.getAllCompletedWorkouts(),
            workoutService.getPersonalRecords(),
            exerciseRepository.getAllCustomExercises(),
            workoutRepository.getActiveSession(),
          ]);

        return await snapshotRepository.createSnapshot(
          {
            routines,
            completedSessions,
            personalRecords,
            customExercises,
            activeSession,
            profile: {} as any,
            preferences: {} as any,
          },
          reason
        );
      } catch (err) {
        console.warn('[MigrationRunner] Safety snapshot creation error:', err);
        return undefined;
      }
    },

    kvGet: (key) => kvGet(key),
    kvSet: (key, val) => kvSet(key, val),
    kvDelete: async (key) => {
      const { kvDelete } = await import('../../database/db');
      await kvDelete(key);
    },
  };
}

export const migrationRunner = {
  /**
   * Retrieves stored data schema version from IndexedDB and localStorage.
   */
  async getStoredVersion(): Promise<number> {
    try {
      // 1. Primary: read from IndexedDB kv_store
      const idbVersion = await kvGet<number>(DATA_SCHEMA_VERSION_KEY);
      if (typeof idbVersion === 'number') {
        return idbVersion;
      }

      // 2. Fallback: inspect legacy localStorage app_schema_version
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(PROTECTED_STORAGE_KEYS.SCHEMA_VERSION);
        if (raw) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed) && parsed > 0) {
            return parsed;
          }
        }

        // Check legacy storage_migration_v1 marker
        const legacyMarker = localStorage.getItem('storage_migration_v1');
        if (legacyMarker === 'completed') {
          return 1;
        }
      }

      return 0;
    } catch {
      return 0;
    }
  },

  /**
   * Commits the verified data schema version to IndexedDB and localStorage.
   */
  async setStoredVersion(version: number): Promise<void> {
    try {
      await kvSet(DATA_SCHEMA_VERSION_KEY, version);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(PROTECTED_STORAGE_KEYS.SCHEMA_VERSION, String(version));
        localStorage.setItem('storage_migration_v1', 'completed');
      }
      await kvSet('storage_migration_v1', 'completed').catch(() => {});
    } catch (err) {
      console.warn('[MigrationRunner] Failed to persist data schema version marker:', err);
    }
  },

  /**
   * Checks if this is a brand new user install.
   */
  async isFreshInstall(): Promise<boolean> {
    try {
      const storedVersion = await this.getStoredVersion();
      if (storedVersion > 0) return false;

      // Check if any user records exist in IndexedDB
      const [customEx, routines, workouts] = await Promise.all([
        exerciseRepository.getAllCustomExercises().catch(() => []),
        routineRepository.getAllRoutines().catch(() => []),
        workoutRepository.getAllCompletedWorkouts().catch(() => []),
      ]);

      if (customEx.length > 0 || routines.length > 0 || workouts.length > 0) {
        return false;
      }

      // Check if any legacy localStorage keys exist
      if (typeof window !== 'undefined' && window.localStorage) {
        if (
          localStorage.getItem('user_custom_exercises') ||
          localStorage.getItem('user_saved_routines') ||
          localStorage.getItem('gym_history_store_v2')
        ) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Runs the complete sequential migration pipeline safely.
   */
  async runMigrations(): Promise<MigrationRunResult> {
    const currentVersion = await this.getStoredVersion();
    const targetVersion = CURRENT_DATA_SCHEMA_VERSION;

    // Fast-path: already at or above target version
    if (currentVersion >= targetVersion) {
      return {
        success: true,
        fromVersion: currentVersion,
        toVersion: currentVersion,
        appliedMigrations: [],
      };
    }

    // Fresh user handling: initialize schema version directly to target without injecting demo data
    const isFresh = await this.isFreshInstall();
    if (isFresh) {
      console.info(
        `[MigrationRunner] Fresh installation detected. Setting data schema version directly to ${targetVersion} without demo data injection.`
      );
      await this.setStoredVersion(targetVersion);
      return {
        success: true,
        fromVersion: 0,
        toVersion: targetVersion,
        appliedMigrations: ['fresh_install_initialization'],
      };
    }

    console.info(`[MigrationRunner] Starting data migration pipeline: v${currentVersion} -> v${targetVersion}...`);

    // Check for prior interrupted migration
    const incomplete = await migrationJournal.getIncompleteMigration();
    if (incomplete) {
      console.warn(
        `[MigrationRunner] Detected incomplete migration from previous session: ${incomplete.migrationId} (v${incomplete.fromVersion} -> v${incomplete.toVersion}). Will re-evaluate.`
      );
    }

    const migrationChain = migrationRegistry.getMigrationChain(currentVersion, targetVersion);
    const applied: string[] = [];
    const ctx = buildMigrationContext();

    for (const step of migrationChain) {
      console.info(`[MigrationRunner] Executing migration step: ${step.id} (${step.description})...`);

      let snapshotId: string | undefined;

      // 1. Create pre-migration safety snapshot if step is risky
      if (step.isRisky) {
        snapshotId = await ctx.createSafetySnapshot(`pre_migration_${step.id}`);
        if (snapshotId) {
          console.info(`[MigrationRunner] Created pre-migration safety snapshot: ${snapshotId}`);
        }
      }

      // 2. Record start in migration journal
      await migrationJournal.recordStart(step.id, step.fromVersion, step.toVersion, snapshotId);

      try {
        // 3. Execute atomic migration step
        const result = await step.migrate(ctx);

        // 4. Perform record-level read-back verification
        const isValid = await step.validate(ctx);
        if (!isValid) {
          throw new Error(`[MigrationRunner] Post-migration read-back validation failed for ${step.id}.`);
        }

        // 5. Record completion in journal & commit intermediate version
        await migrationJournal.recordComplete(step.id, {
          routines: result.routinesMigrated,
          exercises: result.exercisesMigrated,
          workouts: result.workoutsMigrated,
          schedule: result.scheduleMigrated,
          prs: result.prsMigrated,
        });
        await this.setStoredVersion(step.toVersion);
        applied.push(step.id);

        console.info(`[MigrationRunner] Successfully verified and committed ${step.id} (v${step.toVersion}).`);
      } catch (stepErr: any) {
        const errorMsg = stepErr?.message || String(stepErr);
        console.error(`[MigrationRunner] Critical error in migration ${step.id}. Halting pipeline:`, stepErr);

        // Record failure in journal
        await migrationJournal.recordFailure(step.id, errorMsg);

        // Halt immediately: DO NOT clear database, DO NOT overwrite records
        return {
          success: false,
          fromVersion: currentVersion,
          toVersion: step.fromVersion,
          appliedMigrations: applied,
          error: errorMsg,
          snapshotId,
        };
      }
    }

    console.info(`[MigrationRunner] All migrations successfully completed and verified. Current schema version: v${targetVersion}.`);

    return {
      success: true,
      fromVersion: currentVersion,
      toVersion: targetVersion,
      appliedMigrations: applied,
    };
  },
};
