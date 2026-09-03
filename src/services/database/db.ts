/**
 * GYM PWA - Core IndexedDB Database Service
 * Database Name: gym_offline_db
 * Version: 1
 *
 * Local Data is the Single Source of Truth.
 */

export const DB_NAME = 'gym_offline_db';
export const DB_VERSION = 1;

export const STORES = {
  KV_STORE: 'kv_store',           // Key-value store for Zustand store states
  ACTIVE_SESSION: 'active_session', // Active workout session for instant crash recovery
  WORKOUTS: 'workouts',           // Completed workout history
  ROUTINES: 'routines',           // Custom and default routines
  EXERCISES: 'exercises',         // Custom movements and exercise preferences
  SNAPSHOTS: 'snapshots',         // Automatic local recovery snapshots (latest 3)
  METADATA: 'db_metadata',        // Schema version, migration tracking
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Opens and initializes the IndexedDB database instance with transactional schema versioning.
 */
export function getDatabase(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      // Version 1 Schema Setup
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
    };

    request.onsuccess = () => {
      const db = request.result;

      // Handle unexpected database close/version change
      db.onversionchange = () => {
        db.close();
        dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      dbPromise = null;
      reject(request.error || new Error('Failed to open IndexedDB database.'));
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
        reject(transaction.error || new Error(`Transaction failed on ${storeName}`));
      };

      transaction.onabort = () => {
        reject(new Error(`Transaction aborted on ${storeName}`));
      };

      // Execute callback
      const callbackResult = callback(store, transaction);
      if (callbackResult instanceof Promise) {
        callbackResult
          .then((res) => {
            result = res;
          })
          .catch((err) => {
            transaction.abort();
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
