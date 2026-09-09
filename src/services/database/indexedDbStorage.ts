/**
 * Custom Asynchronous StateStorage Adapter for Zustand Persist Middleware
 * Primary Backend: IndexedDB (gym_offline_db -> kv_store)
 *
 * Phase 3 Decoupling:
 * - IndexedDB is the durable source of truth.
 * - Large user datasets (workouts, exercises, routines, active session) are stored
 *   in IndexedDB and are NOT mirrored into localStorage to prevent QuotaExceededError
 *   and heavy JSON stringification lag on the main thread.
 * - Legacy localStorage values are inspected on startup as a backward-compatible fallback,
 *   migrated into IndexedDB, and preserved as a safe recovery path.
 */

import { StateStorage } from 'zustand/middleware';
import { kvGet, kvSet, kvDelete } from './db';

// In-memory fallback for environments with blocked storage
const memoryFallback = new Map<string, string>();

// Large collection keys that must not bloat localStorage
const LARGE_USER_DATA_KEYS = new Set([
  'gym_history_store_v2',
  'gym_exercise_library_store_v2',
  'gym_routines_store_v2',
  'gym_active_workout_store',
]);

/**
 * Creates an asynchronous StateStorage engine backed by IndexedDB.
 */
export const indexedDbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // 1. Primary Read: Fetch from IndexedDB kv_store
      const value = await kvGet<string>(name);
      if (value !== null && value !== undefined) {
        return value;
      }

      // 2. Fallback Read: Inspect legacy localStorage for existing user data
      if (typeof window !== 'undefined' && window.localStorage) {
        const legacyValue = localStorage.getItem(name);
        if (legacyValue) {
          // Asynchronously migrate to IndexedDB as durable store
          kvSet(name, legacyValue).catch(() => {});
          return legacyValue;
        }
      }

      // 3. Fallback to memory map
      return memoryFallback.get(name) || null;
    } catch (err) {
      console.warn(`[GYM DB] Error reading "${name}" from IndexedDB, falling back:`, err);
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(name);
      }
      return memoryFallback.get(name) || null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // 1. Write to memory fallback immediately for synchronous availability
    memoryFallback.set(name, value);

    // 2. Only mirror lightweight metadata keys to localStorage; never large datasets
    if (!LARGE_USER_DATA_KEYS.has(name)) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(name, value);
        }
      } catch (lsErr) {
        console.warn(`[GYM DB] LocalStorage write error for metadata key "${name}":`, lsErr);
      }
    }

    // 3. Primary asynchronous persistence to IndexedDB
    try {
      await kvSet(name, value);
    } catch (err) {
      console.error(`[GYM DB] Error writing "${name}" to IndexedDB:`, err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await kvDelete(name);
      memoryFallback.delete(name);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(name);
      }
    } catch (err) {
      console.warn(`[GYM DB] Error removing "${name}" from IndexedDB:`, err);
      memoryFallback.delete(name);
    }
  },
};

/**
 * Helper to create a store-specific JSON storage adapter.
 */
export function createIndexedDbStorage() {
  return indexedDbStorage;
}
