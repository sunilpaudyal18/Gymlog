import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorkoutSession, PersonalRecord } from '../types';
import { indexedDbStorage } from '../services/database/indexedDbStorage';
import { workoutService } from '../services/data/workoutService';

interface HistoryState {
  completedSessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  setLoadedWorkouts: (sessions: WorkoutSession[]) => void;
  setLoadedPersonalRecords: (prs: PersonalRecord[]) => void;
  addCompletedSession: (session: WorkoutSession) => void;
  getWeeklyVolume: () => number;
  getTotalWorkouts: () => number;
  getWeeklyFrequency: () => number;
  resetToDefaults: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      completedSessions: [],
      personalRecords: [],

      setLoadedWorkouts: (sessions) => {
        set({ completedSessions: sessions });
      },

      setLoadedPersonalRecords: (prs) => {
        set({ personalRecords: prs });
      },

      addCompletedSession: (session) => {
        workoutService.saveCompletedWorkout(session).catch(console.error);
        set((state) => ({
          completedSessions: [session, ...state.completedSessions],
        }));
      },

      getWeeklyVolume: () => {
        const { completedSessions } = get();
        const oneWeekAgo = Date.now() - 7 * 86400000;
        return completedSessions
          .filter((s) => s.completedAt !== undefined && s.completedAt >= oneWeekAgo)
          .reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
      },

      getTotalWorkouts: () => {
        return get().completedSessions.length;
      },

      getWeeklyFrequency: () => {
        const { completedSessions } = get();
        const oneWeekAgo = Date.now() - 7 * 86400000;
        return completedSessions.filter((s) => s.completedAt !== undefined && s.completedAt >= oneWeekAgo).length;
      },

      resetToDefaults: () => {
        set({
          completedSessions: [],
          personalRecords: [],
        });
      },
    }),
    {
      name: 'gym_history_store_v2',
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        // Phase 3: Completed workouts are durably stored in IndexedDB STORES.WORKOUTS
        // Only personal records are persisted in kv_store, preventing huge JSON serialization in localStorage
        personalRecords: state.personalRecords,
      }),
    }
  )
);

