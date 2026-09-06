import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Routine, RoutineExercise, MuscleGroup } from '../types';
import { PRESET_ROUTINES } from '../constants/routines';
import { indexedDbStorage } from '../services/database/indexedDbStorage';
import { calculateEstimatedDurationMin } from '../utils/workoutCalc';
import { DEFAULT_WEEKLY_SCHEDULE, getCurrentDayIndex } from '../utils/scheduler';

interface RoutineState {
  routines: Routine[];
  activeRoutineId: string;
  setActiveRoutineId: (id: string) => void;
  addRoutine: (routine: Routine) => void;
  updateRoutine: (id: string, updated: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (routine: Routine) => void;
  reorderRoutineExercises: (routineId: string, fromIndex: number, toIndex: number) => void;
  addExerciseToRoutine: (routineId: string, exercise: RoutineExercise) => void;
  updateRoutineExercise: (routineId: string, exerciseId: string, updated: Partial<RoutineExercise>) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  weeklySchedule: Record<number, string | null>;
  setDaySchedule: (dayOfWeek: number, routineId: string | null) => void;
  splitName: string;
  setSplitName: (name: string) => void;
  setDayCustomRoutine: (
    dayOfWeek: number,
    data: { name: string; targetMuscles: MuscleGroup[]; exercises: RoutineExercise[] }
  ) => Routine;
  setDayRest: (dayOfWeek: number) => void;
  getScheduledRoutineForDay: (dayOfWeek: number) => Routine | null;
  getTodayScheduledRoutine: () => Routine | null;
  swapTodayRoutine: (routineId: string | null) => void;
  getRoutineById: (id: string) => Routine | undefined;
  getActiveRoutine: () => Routine | undefined;
  resetToDefaults: () => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: PRESET_ROUTINES,
      activeRoutineId: 'chest-triceps-focus',
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      splitName: 'Routine Planner: 4-Day Split',

      setSplitName: (name) => set({ splitName: name }),

      setDayRest: (dayOfWeek) => {
        get().setDaySchedule(dayOfWeek, null);
      },

      setDayCustomRoutine: (dayOfWeek, data) => {
        const { routines, weeklySchedule } = get();
        const existingRoutineId = weeklySchedule[dayOfWeek];
        const estimatedMin = calculateEstimatedDurationMin(data.exercises);

        if (existingRoutineId && routines.some((r) => r.id === existingRoutineId)) {
          // Update the existing routine
          const updatedRoutine: Routine = {
            ...routines.find((r) => r.id === existingRoutineId)!,
            name: data.name,
            targetMuscles: data.targetMuscles,
            exercises: data.exercises,
            estimatedDurationMin: estimatedMin,
            updatedAt: Date.now(),
          };
          set((state) => ({
            routines: state.routines.map((r) => (r.id === existingRoutineId ? updatedRoutine : r)),
          }));
          return updatedRoutine;
        } else {
          // Create a brand new custom routine and assign it to this day
          const newId = `routine-day-${dayOfWeek}-${Date.now()}`;
          const newRoutine: Routine = {
            id: newId,
            name: data.name,
            targetMuscles: data.targetMuscles,
            exercises: data.exercises,
            estimatedDurationMin: estimatedMin,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            lastPerformed: 'Not performed yet',
          };
          set((state) => ({
            routines: [newRoutine, ...state.routines],
            weeklySchedule: {
              ...state.weeklySchedule,
              [dayOfWeek]: newId,
            },
          }));
          return newRoutine;
        }
      },

  setActiveRoutineId: (id) =>
    set((state) => ({
      activeRoutineId: id,
      routines: state.routines.map((r) => ({
        ...r,
        isActive: r.id === id,
      })),
    })),

  addRoutine: (routine) => {
    const estimatedMin =
      routine.estimatedDurationMin || calculateEstimatedDurationMin(routine.exercises);
    const enriched = { ...routine, estimatedDurationMin: estimatedMin };
    set((state) => ({
      routines: [enriched, ...state.routines],
    }));
  },

  updateRoutine: (id, updated) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== id) return r;
        const newExercises = updated.exercises || r.exercises;
        const estimatedMin = calculateEstimatedDurationMin(newExercises);
        return {
          ...r,
          ...updated,
          estimatedDurationMin: estimatedMin,
          updatedAt: Date.now(),
        };
      }),
    })),

  deleteRoutine: (id) =>
    set((state) => {
      const remaining = state.routines.filter((r) => r.id !== id);
      const newActiveId =
        state.activeRoutineId === id && remaining.length > 0
          ? remaining[0].id
          : state.activeRoutineId;
      return {
        routines: remaining,
        activeRoutineId: newActiveId,
      };
    }),

  duplicateRoutine: (routine) => {
    const newId = 'routine-dup-' + Date.now();
    const duplicated: Routine = {
      ...routine,
      id: newId,
      name: `${routine.name} (Copy)`,
      isActive: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastPerformed: 'Never',
    };
    set((state) => ({
      routines: [duplicated, ...state.routines],
    }));
  },

  reorderRoutineExercises: (routineId, fromIndex, toIndex) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== routineId) return r;
        const list = [...r.exercises];
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);
        const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
        return {
          ...r,
          exercises: reordered,
          updatedAt: Date.now(),
        };
      }),
    })),

  addExerciseToRoutine: (routineId, exercise) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== routineId) return r;
        // Check if already in routine; if so update it
        const exists = r.exercises.some((e) => e.id === exercise.id || e.exerciseId === exercise.exerciseId);
        let newExercises: RoutineExercise[];
        if (exists) {
          newExercises = r.exercises.map((e) =>
            e.id === exercise.id || e.exerciseId === exercise.exerciseId ? { ...e, ...exercise } : e
          );
        } else {
          newExercises = [...r.exercises, { ...exercise, order: r.exercises.length + 1 }];
        }
        return {
          ...r,
          exercises: newExercises,
          estimatedDurationMin: calculateEstimatedDurationMin(newExercises),
          updatedAt: Date.now(),
        };
      }),
    })),

  updateRoutineExercise: (routineId, exerciseId, updated) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== routineId) return r;
        const newExercises = r.exercises.map((e) =>
          e.id === exerciseId || e.exerciseId === exerciseId ? { ...e, ...updated } : e
        );
        return {
          ...r,
          exercises: newExercises,
          estimatedDurationMin: calculateEstimatedDurationMin(newExercises),
          updatedAt: Date.now(),
        };
      }),
    })),

  removeExerciseFromRoutine: (routineId, exerciseId) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== routineId) return r;
        const filtered = r.exercises.filter((ex) => ex.id !== exerciseId && ex.exerciseId !== exerciseId);
        const reindexed = filtered.map((ex, idx) => ({ ...ex, order: idx + 1 }));
        return {
          ...r,
          exercises: reindexed,
          estimatedDurationMin: calculateEstimatedDurationMin(reindexed),
          updatedAt: Date.now(),
        };
      }),
    })),

  setDaySchedule: (dayOfWeek, routineId) =>
    set((state) => ({
      weeklySchedule: {
        ...state.weeklySchedule,
        [dayOfWeek]: routineId,
      },
    })),

  swapTodayRoutine: (routineId) => {
    const todayIndex = getCurrentDayIndex();
    get().setDaySchedule(todayIndex, routineId);
  },

  getScheduledRoutineForDay: (dayOfWeek) => {
    const { routines, weeklySchedule } = get();
    const routineId = weeklySchedule[dayOfWeek];
    if (!routineId) return null;
    return routines.find((r) => r.id === routineId) || null;
  },

  getTodayScheduledRoutine: () => {
    const todayIndex = getCurrentDayIndex();
    return get().getScheduledRoutineForDay(todayIndex);
  },

  getRoutineById: (id) => get().routines.find((r) => r.id === id),

  getActiveRoutine: () => {
    // Check if there is a scheduled routine for today first
    const todayRoutine = get().getTodayScheduledRoutine();
    if (todayRoutine) return todayRoutine;

    const { routines, activeRoutineId } = get();
    return routines.find((r) => r.id === activeRoutineId) || routines[0];
  },

  resetToDefaults: () => {
    set({
      routines: PRESET_ROUTINES,
      activeRoutineId: 'chest-triceps-focus',
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      splitName: 'Routine Planner: 4-Day Split',
    });
  },
}),
    {
      name: 'gym_routines_store_v2',
      storage: createJSONStorage(() => indexedDbStorage),
      partialize: (state) => ({
        routines: state.routines,
        activeRoutineId: state.activeRoutineId,
        weeklySchedule: state.weeklySchedule,
        splitName: state.splitName,
      }),
    }
  )
);

