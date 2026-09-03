/**
 * Custom Asynchronous StateStorage Adapter for Zustand Persist Middleware
 * Primary Backend: IndexedDB (gym_offline_db -> kv_store)
 *
 * Automatic One-Time Migration:
 * Inspects legacy localStorage on initial read, migrates data to IndexedDB,
 * and clears legacy localStorage key to maintain a single source of truth.
 */

import { StateStorage } from 'zustand/middleware';
import { kvGet, kvSet, kvDelete } from './db';

// In-memory fallback for environments with blocked storage
const memoryFallback = new Map<string, string>();

/**
 * Creates an asynchronous StateStorage engine backed by IndexedDB.
 */
export const indexedDbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // 1. Attempt to fetch from IndexedDB
      const value = await kvGet<string>(name);
      if (value !== null && value !== undefined) {
        return value;
      }

      // 2. One-Time Legacy Migration from localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const legacyValue = localStorage.getItem(name);
        if (legacyValue) {
          try {
            // Write legacy data directly into IndexedDB
            await kvSet(name, legacyValue);
            // Clean up localStorage to prevent double source of truth
            localStorage.removeItem(name);
            console.info(`[GYM DB] Successfully migrated "${name}" from localStorage to IndexedDB.`);
            return legacyValue;
          } catch (migrateErr) {
            console.warn(`[GYM DB] Migration write error for "${name}":`, migrateErr);
            return legacyValue;
          }
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
    try {
      // Primary persistence to IndexedDB
      await kvSet(name, value);
      memoryFallback.set(name, value);
    } catch (err) {
      console.error(`[GYM DB] Error writing "${name}" to IndexedDB:`, err);
      memoryFallback.set(name, value);
      // Secondary fallback
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem(name, value);
        }
      } catch (lsErr) {
        console.warn(`[GYM DB] LocalStorage fallback write failed:`, lsErr);
      }
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
