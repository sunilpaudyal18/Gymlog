/**
 * GYM PWA - Persistent Storage Manager
 * Interacts with the Browser StorageManager API (navigator.storage.persist / persisted)
 * to protect IndexedDB and LocalStorage from eviction under device storage pressure.
 *
 * Guarantees:
 * - Asynchronous & non-blocking execution.
 * - Safe to call multiple times (idempotent).
 * - Never throws unhandled errors or crashes on unsupported platforms.
 * - Minimal, high-value logging without production log spam.
 */

export type StoragePersistenceStatus =
  | 'unknown'
  | 'supported-and-persistent'
  | 'supported-but-not-persistent'
  | 'unsupported'
  | 'request-failed';

export interface StorageEstimateResult {
  usage?: number;
  quota?: number;
  percentageUsed?: number;
}

type PersistenceListener = (status: StoragePersistenceStatus) => void;

let currentStatus: StoragePersistenceStatus = 'unknown';
let persistencePromise: Promise<StoragePersistenceStatus> | null = null;
const statusListeners = new Set<PersistenceListener>();

/**
 * Returns the currently known storage persistence status synchronously.
 */
export function getPersistenceStatus(): StoragePersistenceStatus {
  return currentStatus;
}

/**
 * Subscribes to changes in storage persistence status.
 */
export function subscribePersistenceStatus(listener: PersistenceListener): () => void {
  statusListeners.add(listener);
  return () => statusListeners.delete(listener);
}

function updateStatus(newStatus: StoragePersistenceStatus): void {
  if (currentStatus !== newStatus) {
    currentStatus = newStatus;
    statusListeners.forEach((listener) => {
      try {
        listener(newStatus);
      } catch (err) {
        console.warn('[PersistentStorage] Error in status listener:', err);
      }
    });
  }
}

/**
 * Checks whether persistent storage is supported and already granted,
 * and requests persistence from the browser if not yet persistent.
 *
 * Safe to call repeatedly; concurrent calls share the ongoing execution.
 */
export async function initPersistentStorage(): Promise<StoragePersistenceStatus> {
  // Return cached result if already resolved to a conclusive state
  if (currentStatus === 'supported-and-persistent' || currentStatus === 'unsupported') {
    return currentStatus;
  }

  // Deduplicate in-flight requests
  if (persistencePromise) {
    return persistencePromise;
  }

  persistencePromise = (async (): Promise<StoragePersistenceStatus> => {
    try {
      if (
        typeof navigator === 'undefined' ||
        !navigator.storage ||
        typeof navigator.storage.persist !== 'function' ||
        typeof navigator.storage.persisted !== 'function'
      ) {
        updateStatus('unsupported');
        return 'unsupported';
      }

      // 1. Check if storage is already persistent
      const isAlreadyPersisted = await navigator.storage.persisted().catch(() => false);
      if (isAlreadyPersisted) {
        updateStatus('supported-and-persistent');
        if (process.env.NODE_ENV === 'development') {
          console.info('[PersistentStorage] Storage is already persistent.');
        }
        return 'supported-and-persistent';
      }

      // 2. Request persistent storage from the browser
      const granted = await navigator.storage.persist().catch(() => false);
      const nextStatus: StoragePersistenceStatus = granted
        ? 'supported-and-persistent'
        : 'supported-but-not-persistent';

      updateStatus(nextStatus);

      if (process.env.NODE_ENV === 'development') {
        if (granted) {
          console.info('[PersistentStorage] Persistent storage successfully granted by browser.');
        } else {
          console.info('[PersistentStorage] Persistent storage request denied or not granted.');
        }
      }

      return nextStatus;
    } catch (err) {
      console.warn('[PersistentStorage] Error checking or requesting persistence:', err);
      updateStatus('request-failed');
      return 'request-failed';
    } finally {
      persistencePromise = null;
    }
  })();

  return persistencePromise;
}

/**
 * Inspects current disk quota and usage if supported by the browser.
 */
export async function getStorageQuotaEstimate(): Promise<StorageEstimateResult | null> {
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.storage &&
      typeof navigator.storage.estimate === 'function'
    ) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage;
      const quota = estimate.quota;
      const percentageUsed =
        usage !== undefined && quota !== undefined && quota > 0
          ? Math.round((usage / quota) * 1000) / 10
          : undefined;

      return { usage, quota, percentageUsed };
    }
    return null;
  } catch (err) {
    console.warn('[PersistentStorage] Error querying storage estimate:', err);
    return null;
  }
}
