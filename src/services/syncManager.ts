import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OutboxItem {
  id: string;
  operationType: 'CREATE_SESSION' | 'UPDATE_ROUTINE' | 'DELETE_ROUTINE' | 'UPDATE_PREFERENCES';
  entityType: 'workout_session' | 'routine' | 'user_profile';
  entityId: string;
  payload: any;
  createdAt: number;
  updatedAt: number;
  retryCount: number;
  nextRetryAt?: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
  lastError?: string;
  idempotencyKey: string;
}

export type ConnectionState = 'online' | 'offline' | 'reconnecting' | 'syncing' | 'synced' | 'sync_error';

interface SyncManagerState {
  isOnline: boolean;
  connectionState: ConnectionState;
  outbox: OutboxItem[];
  lastSyncedAt: number | null;
  isProcessing: boolean;

  // Actions
  queueMutation: (
    operationType: OutboxItem['operationType'],
    entityType: OutboxItem['entityType'],
    entityId: string,
    payload: any,
    idempotencyKey?: string
  ) => void;
  processOutbox: () => Promise<void>;
  setIsOnline: (online: boolean) => void;
  clearCompleted: () => void;
}

export const useSyncManager = create<SyncManagerState>()(
  persist(
    (set, get) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionState: typeof navigator !== 'undefined' && navigator.onLine ? 'synced' : 'offline',
      outbox: [],
      lastSyncedAt: Date.now(),
      isProcessing: false,

      setIsOnline: (online) => {
        set({
          isOnline: online,
          connectionState: online ? 'online' : 'offline',
        });
        if (online) {
          get().processOutbox();
        }
      },

      queueMutation: (operationType, entityType, entityId, payload, idempotencyKey) => {
        const key = idempotencyKey || `${operationType}-${entityId}-${Date.now()}`;
        const existing = get().outbox.find((item) => item.idempotencyKey === key);

        // Idempotency: Ignore duplicate queue additions
        if (existing) {
          return;
        }

        const newItem: OutboxItem = {
          id: 'outbox-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          operationType,
          entityType,
          entityId,
          payload,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          retryCount: 0,
          status: 'pending',
          idempotencyKey: key,
        };

        set((state) => ({
          outbox: [...state.outbox, newItem],
          connectionState: state.isOnline ? 'syncing' : 'offline',
        }));

        // Trigger processing if online
        if (get().isOnline) {
          get().processOutbox();
        }
      },

      processOutbox: async () => {
        const { isOnline, isProcessing, outbox } = get();
        if (!isOnline || isProcessing || outbox.length === 0) return;

        set({ isProcessing: true, connectionState: 'syncing' });

        const pendingItems = outbox.filter((item) => item.status === 'pending' || item.status === 'failed');

        for (const item of pendingItems) {
          try {
            // Simulated cloud synchronization endpoint with simulated network latency
            await new Promise((res) => setTimeout(res, 200));

            // Mark item as completed
            set((state) => ({
              outbox: state.outbox.map((i) =>
                i.id === item.id
                  ? { ...i, status: 'completed', updatedAt: Date.now() }
                  : i
              ),
            }));
          } catch (err: any) {
            // Exponential backoff
            set((state) => ({
              outbox: state.outbox.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      status: 'failed',
                      retryCount: i.retryCount + 1,
                      lastError: err?.message || 'Sync failed',
                      updatedAt: Date.now(),
                    }
                  : i
              ),
            }));
          }
        }

        const remainingPending = get().outbox.filter((i) => i.status === 'pending' || i.status === 'failed');

        set({
          isProcessing: false,
          connectionState: remainingPending.length === 0 ? 'synced' : 'sync_error',
          lastSyncedAt: Date.now(),
        });

        // Clean up completed items older than 5 minutes
        get().clearCompleted();
      },

      clearCompleted: () => {
        set((state) => ({
          outbox: state.outbox.filter((i) => i.status !== 'completed'),
        }));
      },
    }),
    {
      name: 'gym_sync_outbox_store',
      partialize: (state) => ({
        outbox: state.outbox,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

// Global connectivity event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useSyncManager.getState().setIsOnline(true);
  });

  window.addEventListener('offline', () => {
    useSyncManager.getState().setIsOnline(false);
  });
}
