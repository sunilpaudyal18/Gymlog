/**
 * Data Migration Types & Interfaces - Phase 4 Architecture
 *
 * Defines the core contract for versioned, atomic, and safe schema migrations.
 */

import { Exercise, Routine, WorkoutSession, PersonalRecord } from '../../../types';
import { PlannerScheduleData } from '../routineService';

export type MigrationStatus = 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';

export interface MigrationJournalEntry {
  migrationId: string;
  fromVersion: number;
  toVersion: number;
  status: MigrationStatus;
  startedAt: number;
  completedAt?: number;
  snapshotId?: string;
  error?: string;
  recordsAffected?: {
    routines?: number;
    exercises?: number;
    workouts?: number;
    schedule?: boolean;
    prs?: number;
  };
}

export interface MigrationContext {
  // Repositories for durable records in IndexedDB
  getRoutines: () => Promise<Routine[]>;
  saveRoutine: (routine: Routine) => Promise<boolean>;
  deleteRoutine: (id: string) => Promise<boolean>;

  getCustomExercises: () => Promise<Exercise[]>;
  saveCustomExercise: (exercise: Exercise) => Promise<boolean>;
  deleteCustomExercise: (id: string) => Promise<boolean>;

  getCompletedWorkouts: () => Promise<WorkoutSession[]>;
  saveCompletedWorkout: (workout: WorkoutSession) => Promise<boolean>;

  getPersonalRecords: () => Promise<PersonalRecord[]>;
  savePersonalRecords: (prs: PersonalRecord[]) => Promise<boolean>;

  getPlannerSchedule: () => Promise<PlannerScheduleData | null>;
  savePlannerSchedule: (schedule: Record<number, string | null>, splitName: string) => Promise<boolean>;

  getActiveSession: () => Promise<WorkoutSession | null>;
  saveActiveSession: (session: WorkoutSession) => Promise<boolean>;

  // Safety snapshot creation
  createSafetySnapshot: (reason: string) => Promise<string | undefined>;

  // KV store access
  kvGet: <T = any>(key: string) => Promise<T | null>;
  kvSet: <T = any>(key: string, value: T) => Promise<void>;
  kvDelete: (key: string) => Promise<void>;
}

export interface DataMigration {
  /**
   * Unique migration identifier (e.g. 'v1-to-v2-taxonomy-normalization')
   */
  readonly id: string;

  /**
   * Starting data schema version for this step
   */
  readonly fromVersion: number;

  /**
   * Resulting data schema version after this step completes
   */
  readonly toVersion: number;

  /**
   * Human-readable description of changes
   */
  readonly description: string;

  /**
   * Whether this migration alters existing records and warrants a pre-migration safety snapshot
   */
  readonly isRisky: boolean;

  /**
   * Executes the atomic transformation
   */
  migrate: (ctx: MigrationContext) => Promise<{
    routinesMigrated?: number;
    exercisesMigrated?: number;
    workoutsMigrated?: number;
    scheduleMigrated?: boolean;
    prsMigrated?: number;
  }>;

  /**
   * Performs read-back verification directly from IndexedDB
   */
  validate: (ctx: MigrationContext) => Promise<boolean>;
}

export interface MigrationRunResult {
  success: boolean;
  fromVersion: number;
  toVersion: number;
  appliedMigrations: string[];
  error?: string;
  snapshotId?: string;
}
