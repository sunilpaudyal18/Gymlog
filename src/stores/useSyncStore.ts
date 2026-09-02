import { create } from 'zustand';
import { SyncStatus } from '../types';

interface SyncState {
  status: SyncStatus;
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncState: (state: SyncStatus['syncState'], errorMessage?: string) => void;
  triggerSync: () => Promise<void>;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  status: {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    syncState: 'connected',
    lastSyncedAt: Date.now(),
    pendingChangesCount: 0,
  },

  setOnlineStatus: (isOnline) =>
    set((state) => ({
      status: {
        ...state.status,
        isOnline,
        syncState: isOnline ? 'connected' : 'error',
      },
    })),

  setSyncState: (syncState, errorMessage) =>
    set((state) => ({
      status: {
        ...state.status,
        syncState,
        errorMessage,
        lastSyncedAt: syncState === 'synced' ? Date.now() : state.status.lastSyncedAt,
      },
    })),

  triggerSync: async () => {
    set((state) => ({ status: { ...state.status, syncState: 'syncing' } }));
    // Simulate brief sync
    await new Promise((resolve) => setTimeout(resolve, 1200));
    set((state) => ({
      status: {
        ...state.status,
        syncState: 'synced',
        lastSyncedAt: Date.now(),
        pendingChangesCount: 0,
      },
    }));
  },
}));
