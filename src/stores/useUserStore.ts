import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

export interface UserPreferences {
  weightUnit: 'kg' | 'lb';
  theme: 'dark' | 'system';
  defaultRestSeconds: number;
  autoStartRest: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  weekStartsOn: 'monday' | 'sunday';
  notificationsEnabled: boolean;
}

interface UserState {
  profile: UserProfile;
  preferences: UserPreferences;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: number | null;

  // Actions
  updateProfile: (updated: Partial<UserProfile>) => void;
  updatePreferences: (updated: Partial<UserPreferences>) => void;
  setWeightUnit: (unit: 'kg' | 'lb') => void;
  setDefaultRestSeconds: (seconds: number) => void;
  toggleAutoStartRest: () => void;
  toggleSound: () => void;
  toggleVibration: () => void;
  toggleNotifications: () => void;
  triggerSync: () => Promise<void>;
  signOut: () => void;
}

const INITIAL_PROFILE: UserProfile = {
  id: 'user-alex',
  name: 'Alex Johnson',
  goal: 'MUSCLE GAIN',
  weightKg: 75.5,
  heightFormatted: `5'10"`,
  bmi: 23.4,
  unitPreference: 'kg',
  soundEnabled: true,
  vibrationEnabled: true,
  defaultRestSeconds: 120,
};

const INITIAL_PREFERENCES: UserPreferences = {
  weightUnit: 'kg',
  theme: 'dark',
  defaultRestSeconds: 120,
  autoStartRest: true,
  soundEnabled: true,
  vibrationEnabled: true,
  weekStartsOn: 'monday',
  notificationsEnabled: true,
};

export function convertKgToLb(kg: number): number {
  return Number((kg * 2.20462).toFixed(1));
}

export function convertLbToKg(lb: number): number {
  return Number((lb / 2.20462).toFixed(1));
}

export function formatWeight(kg: number, unit: 'kg' | 'lb'): string {
  if (unit === 'lb') {
    return `${convertKgToLb(kg)} lb`;
  }
  return `${kg} kg`;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: INITIAL_PROFILE,
      preferences: INITIAL_PREFERENCES,
      syncStatus: 'synced',
      lastSyncedAt: Date.now() - 1000 * 60 * 15, // 15 mins ago

      updateProfile: (updated) =>
        set((state) => ({ profile: { ...state.profile, ...updated } })),

      updatePreferences: (updated) =>
        set((state) => ({ preferences: { ...state.preferences, ...updated } })),

      setWeightUnit: (unit) =>
        set((state) => ({
          preferences: { ...state.preferences, weightUnit: unit },
          profile: { ...state.profile, unitPreference: unit },
        })),

      setDefaultRestSeconds: (seconds) =>
        set((state) => ({
          preferences: { ...state.preferences, defaultRestSeconds: seconds },
          profile: { ...state.profile, defaultRestSeconds: seconds },
        })),

      toggleAutoStartRest: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            autoStartRest: !state.preferences.autoStartRest,
          },
        })),

      toggleSound: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            soundEnabled: !state.preferences.soundEnabled,
          },
          profile: {
            ...state.profile,
            soundEnabled: !state.preferences.soundEnabled,
          },
        })),

      toggleVibration: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            vibrationEnabled: !state.preferences.vibrationEnabled,
          },
          profile: {
            ...state.profile,
            vibrationEnabled: !state.preferences.vibrationEnabled,
          },
        })),

      toggleNotifications: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            notificationsEnabled: !state.preferences.notificationsEnabled,
          },
        })),

      triggerSync: async () => {
        set({ syncStatus: 'syncing' });
        await new Promise((res) => setTimeout(res, 1200));
        set({
          syncStatus: navigator.onLine ? 'synced' : 'offline',
          lastSyncedAt: Date.now(),
        });
      },

      signOut: () => {
        // Reset or prepare unauthenticated state while preserving workout database
        set({
          profile: {
            ...INITIAL_PROFILE,
            name: 'Guest Athlete',
          },
        });
      },
    }),
    {
      name: 'gym_user_preferences_store',
      partialize: (state) => ({
        profile: state.profile,
        preferences: state.preferences,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);
