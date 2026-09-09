/**
 * GYM PWA - Core IndexedDB Database Service
 * Database Name: gym_offline_db
 * Version: 1
 *
 * Local Data is the Single Source of Truth.
 * Hardened with:
 * - Strictly additive, non-destructive schema migrations.
 * - Onblocked listener to prevent hangs when opening multiple tabs.
 * - Granular database status tracking ('uninitialized' | 'connecting' | 'ready' | 'error').
 * - Safe QuotaExceededError and abort handling in transactions.
 */

export const DB_NAME = 'gym_offline_db';
export const DB_VERSION = 2;

export const STORES = {
  KV_STORE: 'kv_store',           // Key-value store for Zustand store states
  ACTIVE_SESSION: 'active_session', // Active workout session for instant crash recovery
  WORKOUTS: 'workouts',           // Completed workout history
  ROUTINES: 'routines',           // Custom and default routines
  EXERCISES: 'exercises',         // Custom movements and exercise preferences
  SNAPSHOTS: 'snapshots',         // Automatic local recovery snapshots (latest 3)
  METADATA: 'db_metadata',        // Schema version, migration tracking
  SYNC_OUTBOX: 'sync_outbox',     // Local-first pending sync operations queue
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

export type DBStatus = 'uninitialized' | 'connecting' | 'ready' | 'error';

let dbStatus: DBStatus = 'uninitialized';
let dbPromise: Promise<IDBDatabase> | null = null;
let lastDbError: Error | null = null;

/**
 * Returns current IndexedDB initialization status.
 */
export function getDatabaseStatus(): DBStatus {
  return dbStatus;
}

/**
 * Returns the last recorded database initialization or transaction error.
 */
export function getLastDatabaseError(): Error | null {
  return lastDbError;
}

/**
 * Opens and initializes the IndexedDB database instance with transactional schema versioning.
 */
export function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbStatus = 'connecting';

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      const err = new Error('IndexedDB is not supported in this browser environment.');
      dbStatus = 'error';
      lastDbError = err;
      reject(err);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Prevent open request hang when another tab has the database open with an older version
    request.onblocked = () => {
      console.warn('[DB] IndexedDB open request is blocked by another tab. Please close or reload other tabs.');
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      console.info(`[DB] Upgrading schema: oldVersion=${oldVersion} -> newVersion=${DB_VERSION}`);

      // Version 1 Schema Setup (Strictly Additive)
      if (oldVersion < 1) {
        // 1. Key-Value Store for Zustand store persistence
        if (!db.objectStoreNames.contains(STORES.KV_STORE)) {
          db.createObjectStore(STORES.KV_STORE, { keyPath: 'key' });
        }

        // 2. Active Session for crash recovery
        if (!db.objectStoreNames.contains(STORES.ACTIVE_SESSION)) {
          db.createObjectStore(STORES.ACTIVE_SESSION, { keyPath: 'id' });
        }

        // 3. Completed Workouts with indexes
        if (!db.objectStoreNames.contains(STORES.WORKOUTS)) {
          const workoutStore = db.createObjectStore(STORES.WORKOUTS, { keyPath: 'id' });
          workoutStore.createIndex('completedAt', 'completedAt', { unique: false });
          workoutStore.createIndex('routineId', 'routineId', { unique: false });
          workoutStore.createIndex('status', 'status', { unique: false });
        }

        // 4. Routines Store
        if (!db.objectStoreNames.contains(STORES.ROUTINES)) {
          const routineStore = db.createObjectStore(STORES.ROUTINES, { keyPath: 'id' });
          routineStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 5. Exercises Store
        if (!db.objectStoreNames.contains(STORES.EXERCISES)) {
          const exerciseStore = db.createObjectStore(STORES.EXERCISES, { keyPath: 'id' });
          exerciseStore.createIndex('primaryMuscle', 'primaryMuscle', { unique: false });
          exerciseStore.createIndex('isCustom', 'isCustom', { unique: false });
        }

        // 6. Automatic Recovery Snapshots Store
        if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
          const snapshotStore = db.createObjectStore(STORES.SNAPSHOTS, { keyPath: 'id' });
          snapshotStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 7. Metadata Store
        if (!db.objectStoreNames.contains(STORES.METADATA)) {
          db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
        }
      }

      // Version 2 Schema Setup (Sync Outbox Queue)
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(STORES.SYNC_OUTBOX)) {
          const outboxStore = db.createObjectStore(STORES.SYNC_OUTBOX, { keyPath: 'operationId' });
          outboxStore.createIndex('status', 'status', { unique: false });
          outboxStore.createIndex('entityType', 'entityType', { unique: false });
          outboxStore.createIndex('entityId', 'entityId', { unique: false });
          outboxStore.createIndex('createdAt', 'createdAt', { unique: false });
          outboxStore.createIndex('idempotencyKey', 'idempotencyKey', { unique: false });
        }
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      dbStatus = 'ready';
      lastDbError = null;

      // Track schema migration version in metadata store asynchronously
      try {
        const tx = db.transaction(STORES.METADATA, 'readwrite');
        const metaStore = tx.objectStore(STORES.METADATA);
        metaStore.put({
          key: 'schema_info',
          dbVersion: DB_VERSION,
          openedAt: Date.now(),
        });
      } catch {
        // Metadata write is non-critical
      }

      // Handle unexpected database close/version change
      db.onversionchange = () => {
        console.warn('[DB] Database version changed in another process. Closing connection safely.');
        db.close();
        dbPromise = null;
        dbStatus = 'uninitialized';
      };

      resolve(db);
    };

    request.onerror = () => {
      const err = request.error || new Error('Failed to open IndexedDB database.');
      dbPromise = null;
      dbStatus = 'error';
      lastDbError = err;
      console.error('[DB] Failed to open IndexedDB database:', err);
      reject(err);
    };
  });

  return dbPromise;
}

/**
 * Generic transactional helper to perform a read or write operation on an object store.
 */
export async function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore, transaction: IDBTransaction) => Promise<T> | T
): Promise<T> {
  const db = await getDatabase();
  return new Promise<T>((resolve, reject) => {
    try {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);

      let result: T;

      transaction.oncomplete = () => {
        resolve(result);
      };

      transaction.onerror = () => {
        const err = transaction.error || new Error(`Transaction failed on store "${storeName}"`);
        if (err.name === 'QuotaExceededError') {
          console.error(`[DB] QuotaExceededError while operating on "${storeName}". Storage quota reached.`);
        }
        reject(err);
      };

      transaction.onabort = () => {
        const err = transaction.error || new Error(`Transaction aborted on store "${storeName}"`);
        reject(err);
      };

      // Execute callback safely
      const callbackResult = callback(store, transaction);
      if (callbackResult instanceof Promise) {
        callbackResult
          .then((res) => {
            result = res;
          })
          .catch((err) => {
            try {
              transaction.abort();
            } catch {
              // Ignore if already aborted
            }
            reject(err);
          });
      } else {
        result = callbackResult;
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generic transactional helper to perform atomic operations across multiple object stores in a single transaction.
 */
export async function withStores<T>(
  storeNames: StoreName[],
  mode: IDBTransactionMode,
  callback: (stores: Record<StoreName, IDBObjectStore>, transaction: IDBTransaction) => Promise<T> | T
): Promise<T> {
  const db = await getDatabase();
  return new Promise<T>((resolve, reject) => {
    try {
      const transaction = db.transaction(storeNames, mode);
      const storesRecord = {} as Record<StoreName, IDBObjectStore>;
      for (const name of storeNames) {
        storesRecord[name] = transaction.objectStore(name);
      }

      let result: T;

      transaction.oncomplete = () => {
        resolve(result);
      };

      transaction.onerror = () => {
        const err = transaction.error || new Error(`Transaction failed on stores: ${storeNames.join(', ')}`);
        if (err.name === 'QuotaExceededError') {
          console.error(`[DB] QuotaExceededError while operating on stores: ${storeNames.join(', ')}`);
        }
        reject(err);
      };

      transaction.onabort = () => {
        const err = transaction.error || new Error(`Transaction aborted on stores: ${storeNames.join(', ')}`);
        reject(err);
      };

      const callbackResult = callback(storesRecord, transaction);
      if (callbackResult instanceof Promise) {
        callbackResult
          .then((res) => {
            result = res;
          })
          .catch((err) => {
            try {
              transaction.abort();
            } catch {
              // Ignore if already aborted
            }
            reject(err);
          });
      } else {
        result = callbackResult;
      }
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Low-level KV store get.
 */
export async function kvGet<T = any>(key: string): Promise<T | null> {
  return withStore(STORES.KV_STORE, 'readonly', (store) => {
    return new Promise<T | null>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result ? (request.result.value as T) : null);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Low-level KV store set.
 */
export async function kvSet<T = any>(key: string, value: T): Promise<void> {
  return withStore(STORES.KV_STORE, 'readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.put({ key, value, updatedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Low-level KV store delete.
 */
export async function kvDelete(key: string): Promise<void> {
  return withStore(STORES.KV_STORE, 'readwrite', (store) => {
    return new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Deep IndexedDB Clearance: Purges all core data object stores in a single transaction.
 */
export async function clearAllDatabaseStores(): Promise<void> {
  const db = await getDatabase();
  const targetStores: StoreName[] = [
    STORES.KV_STORE,
    STORES.ACTIVE_SESSION,
    STORES.WORKOUTS,
    STORES.ROUTINES,
    STORES.EXERCISES,
    STORES.SNAPSHOTS,
    STORES.SYNC_OUTBOX,
  ];

  return new Promise<void>((resolve, reject) => {
    try {
      const tx = db.transaction(targetStores, 'readwrite');

      targetStores.forEach((storeName) => {
        if (db.objectStoreNames.contains(storeName)) {
          tx.objectStore(storeName).clear();
        }
      });

      tx.oncomplete = () => {
        console.info('[DB] Successfully cleared all IndexedDB stores in gym_offline_db.');
        resolve();
      };

      tx.onerror = () => {
        console.error('[DB] Transaction error while clearing stores:', tx.error);
        reject(tx.error);
      };

      tx.onabort = () => {
        reject(new Error('Clear all stores transaction aborted.'));
      };
    } catch (err) {
      reject(err);
    }
  });
}

