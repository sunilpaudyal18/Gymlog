/**
 * Migration Registry - Phase 4 Architecture
 *
 * Central registry of all ordered data schema migrations.
 * Calculates sequential migration paths from any historical schema version
 * to the current target version without version gaps.
 */

import { DataMigration } from './migrationTypes';
import { migrationV1Baseline } from './steps/v1_baseline';
import { migrationV2Normalized } from './steps/v2_normalized';

/**
 * Authoritative Current Data Schema Version
 * Increment this whenever a new data migration is added to the registry.
 */
export const CURRENT_DATA_SCHEMA_VERSION = 2;

/**
 * Ordered list of all registered data migrations
 */
export const MIGRATION_REGISTRY: readonly DataMigration[] = [
  migrationV1Baseline,     // v0 -> v1: Baseline IndexedDB ingestion
  migrationV2Normalized,   // v1 -> v2: Taxonomy normalization & schedule hardening
] as const;

export const migrationRegistry = {
  /**
   * Returns current target schema version
   */
  getCurrentVersion(): number {
    return CURRENT_DATA_SCHEMA_VERSION;
  },

  /**
   * Returns all registered migrations
   */
  getAllMigrations(): readonly DataMigration[] {
    return MIGRATION_REGISTRY;
  },

  /**
   * Calculates the sequential chain of migrations required to upgrade from `fromVersion` to `toVersion`.
   */
  getMigrationChain(fromVersion: number, toVersion: number = CURRENT_DATA_SCHEMA_VERSION): DataMigration[] {
    if (fromVersion >= toVersion) {
      return [];
    }

    const chain: DataMigration[] = [];
    let currentVersion = fromVersion;

    while (currentVersion < toVersion) {
      const step = MIGRATION_REGISTRY.find((m) => m.fromVersion === currentVersion);
      if (!step) {
        throw new Error(
          `[MigrationRegistry] Missing migration step from schema version ${currentVersion} to reach target ${toVersion}.`
        );
      }
      chain.push(step);
      currentVersion = step.toVersion;
    }

    return chain;
  },
};
