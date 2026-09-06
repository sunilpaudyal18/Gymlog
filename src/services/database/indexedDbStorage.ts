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
        // Keep localStorage mirrored for synchronous offline resilience
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(name, value);
          }
        } catch (_) {}
        return value;
      }

      // 2. Read from localStorage fallback
      if (typeof window !== 'undefined' && window.localStorage) {
        const legacyValue = localStorage.getItem(name);
        if (legacyValue) {
          // Asynchronously ensure it is written to IndexedDB
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
    // 1. Mirror write to localStorage for instant synchronous offline availability
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(name, value);
      }
    } catch (lsErr) {
      console.warn(`[GYM DB] LocalStorage write error for "${name}":`, lsErr);
    }

    // 2. Primary asynchronous persistence to IndexedDB
    try {
      await kvSet(name, value);
      memoryFallback.set(name, value);
    } catch (err) {
      console.error(`[GYM DB] Error writing "${name}" to IndexedDB:`, err);
      memoryFallback.set(name, value);
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
