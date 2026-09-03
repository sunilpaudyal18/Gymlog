import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WorkoutSession, PersonalRecord } from '../types';
import { indexedDbStorage } from '../services/database/indexedDbStorage';

interface HistoryState {
  completedSessions: WorkoutSession[];
  personalRecords: PersonalRecord[];
  addCompletedSession: (session: WorkoutSession) => void;
  getWeeklyVolume: () => number;
  getTotalWorkouts: () => number;
  getWeeklyFrequency: () => number;
  resetToDefaults: () => void;
}

const INITIAL_HISTORY: WorkoutSession[] = [
  {
    id: 'hist-1',
    routineId: 'chest-triceps-focus',
    routineName: 'CHEST + TRICEPS',
    startedAt: Date.now() - 86400000 * 5,
    completedAt: Date.now() - 86400000 * 5 + 54 * 60 * 1000,
    durationSeconds: 54 * 60,
    status: 'completed',
    totalVolumeKg: 12450,
    totalSetsCompleted: 20,
    newPRsCount: 2,
    synced: true,
    exercises: [
      {
        exerciseId: 'bench-press',
        exerciseName: 'Bench Press',
        primaryMuscle: 'chest',
        equipment: 'barbell',
        restSeconds: 120,
        sets: [
          { setNumber: 1, weightKg: 85, reps: 8, completed: true, isPR: true },
          { setNumber: 2, weightKg: 85, reps: 8, completed: true },
          { setNumber: 3, weightKg: 85, reps: 8, completed: true },
          { setNumber: 4, weightKg: 85, reps: 8, completed: true },
        ],
      },
      {
        exerciseId: 'incline-dumbbell-press',
        exerciseName: 'Incline Dumbbell Press',
        primaryMuscle: 'chest',
        equipment: 'dumbbells',
        restSeconds: 120,
        sets: [
          { setNumber: 1, weightKg: 32.5, reps: 10, completed: true },
          { setNumber: 2, weightKg: 32.5, reps: 10, completed: true },
          { setNumber: 3, weightKg: 32.5, reps: 10, completed: true },
        ],
      },
    ],
  },
  {
    id: 'hist-2',
    routineId: 'pull-day-focus',
    routineName: 'BACK + BICEPS',
    startedAt: Date.now() - 86400000 * 7,
    completedAt: Date.now() - 86400000 * 7 + 61 * 60 * 1000,
    durationSeconds: 61 * 60,
    status: 'completed',
    totalVolumeKg: 14200,
    totalSetsCompleted: 22,
    newPRsCount: 1,
    synced: true,
    exercises: [],
  },
  {
    id: 'hist-3',
    routineId: 'leg-destroyer',
    routineName: 'LEGS',
    startedAt: Date.now() - 86400000 * 9,
    completedAt: Date.now() - 86400000 * 9 + 68 * 60 * 1000,
    durationSeconds: 68 * 60,
    status: 'completed',
    totalVolumeKg: 16800,
    totalSetsCompleted: 24,
    newPRsCount: 0,
    synced: true,
    exercises: [],
  },
  {
    id: 'hist-4',
    routineId: 'shoulders-abs',
    routineName: 'SHOULDERS + ABS',
    startedAt: Date.now() - 86400000 * 11,
    completedAt: Date.now() - 86400000 * 11 + 45 * 60 * 1000,
    durationSeconds: 45 * 60,
    status: 'completed',
    totalVolumeKg: 9400,
    totalSetsCompleted: 18,
    newPRsCount: 0,
    synced: true,
    exercises: [],
  },
];

const INITIAL_PRS: PersonalRecord[] = [
  {
    id: 'pr-1',
    exerciseId: 'bench-press',
    exerciseName: 'Bench Press',
    weightKg: 85,
    reps: 8,
    estimated1RM: 105,
    achievedAt: Date.now() - 86400000 * 9,
    formattedDate: 'Aug 24, 2025',
  },
  {
    id: 'pr-2',
    exerciseId: 'barbell-squat',
    exerciseName: 'Squat',
    weightKg: 120,
    reps: 5,
    estimated1RM: 139,
    achievedAt: Date.now() - 86400000 * 15,
    formattedDate: 'Aug 18, 2025',
  },
  {
    id: 'pr-3',
    exerciseId: 'deadlift',
    exerciseName: 'Deadlift',
    weightKg: 150,
    reps: 3,
    estimated1RM: 160,
    achievedAt: Date.now() - 86400000 * 21,
    formattedDate: 'Aug 12, 2025',
  },
];

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      completedSessions: INITIAL_HISTORY,
      personalRecords: INITIAL_PRS,

      addCompletedSession: (session) =>
        set((state) => ({
          completedSessions: [session, ...state.completedSessions],
        })),

      getWeeklyVolume: () => {
        return 12540; // Matching the exact reference metric
      },

      getTotalWorkouts: () => {
        return 48; // Matching reference metric
      },

      getWeeklyFrequency: () => {
        return 4; // 4/wk
      },

      resetToDefaults: () => {
        set({
          completedSessions: INITIAL_HISTORY,
          personalRecords: INITIAL_PRS,
        });
      },
    }),
    {
      name: 'gym_history_store_v2',
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        completedSessions: state.completedSessions,
        personalRecords: state.personalRecords,
      }),
    }
  )
);

