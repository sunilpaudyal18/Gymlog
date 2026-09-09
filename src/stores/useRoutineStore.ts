import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Routine, RoutineExercise, MuscleGroup } from '../types';
import { PRESET_ROUTINES } from '../constants/routines';
import { indexedDbStorage } from '../services/database/indexedDbStorage';
import { calculateEstimatedDurationMin } from '../utils/workoutCalc';
import { DEFAULT_WEEKLY_SCHEDULE, getCurrentDayIndex } from '../utils/scheduler';
import { routineService } from '../services/data/routineService';

interface RoutineState {
  routines: Routine[];
  activeRoutineId: string;
  setActiveRoutineId: (id: string) => void;
  setLoadedRoutines: (routines: Routine[]) => void;
  setLoadedPlannerSchedule: (schedule: Record<number, string | null>, splitName?: string) => void;
  isHydrated: boolean;
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
      routines: [],
      activeRoutineId: '',
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      splitName: 'My Routine Planner',
      isHydrated: false,

      setLoadedPlannerSchedule: (schedule, splitName) => {
        set((state) => ({
          weeklySchedule: {
            0: schedule?.[0] ?? null,
            1: schedule?.[1] ?? null,
            2: schedule?.[2] ?? null,
            3: schedule?.[3] ?? null,
            4: schedule?.[4] ?? null,
            5: schedule?.[5] ?? null,
            6: schedule?.[6] ?? null,
          },
          splitName: splitName || state.splitName || 'My Routine Planner',
          isHydrated: true,
        }));
      },

      setSplitName: (name) => {
        set((state) => {
          routineService.savePlannerSchedule(state.weeklySchedule, name).catch(console.error);
          return { splitName: name };
        });
      },

      setLoadedRoutines: (loadedRoutines) => {
        set((state) => {
          const activeId =
            state.activeRoutineId && loadedRoutines.some((r) => r.id === state.activeRoutineId)
              ? state.activeRoutineId
              : (loadedRoutines[0]?.id || '');
          return {
            routines: loadedRoutines,
            activeRoutineId: activeId,
            isHydrated: true,
          };
        });
      },

      setDayRest: (dayOfWeek) => {
        get().setDaySchedule(dayOfWeek, null);
      },

      setDayCustomRoutine: (dayOfWeek, data) => {
        const { routines, weeklySchedule, splitName } = get();
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
          routineService.saveRoutine(updatedRoutine).catch(console.error);
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
          routineService.saveRoutine(newRoutine).catch(console.error);
          const nextSchedule = {
            ...weeklySchedule,
            [dayOfWeek]: newId,
          };
          routineService.savePlannerSchedule(nextSchedule, splitName).catch(console.error);
          set((state) => ({
            routines: [newRoutine, ...state.routines],
            weeklySchedule: nextSchedule,
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
    routineService.saveRoutine(enriched).catch(console.error);
    set((state) => ({
      routines: [enriched, ...state.routines],
    }));
  },

  updateRoutine: (id, updated) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== id) return r;
        const exercises = updated.exercises || r.exercises;
        const estimatedMin = calculateEstimatedDurationMin(exercises);
        const merged = {
          ...r,
          ...updated,
          estimatedDurationMin: estimatedMin,
          updatedAt: Date.now(),
        };
        routineService.saveRoutine(merged).catch(console.error);
        return merged;
      }),
    })),

  deleteRoutine: (id) => {
    routineService.deleteRoutine(id).catch(console.error);
    set((state) => {
      const remaining = state.routines.filter((r) => r.id !== id);
      const newActiveId =
        state.activeRoutineId === id && remaining.length > 0
          ? remaining[0].id
          : state.activeRoutineId === id
          ? ''
          : state.activeRoutineId;

      // Unassign deleted routine from weekly schedule if present
      let scheduleChanged = false;
      const updatedSchedule = { ...state.weeklySchedule };
      for (let d = 0; d < 7; d++) {
        if (updatedSchedule[d] === id) {
          updatedSchedule[d] = null;
          scheduleChanged = true;
        }
      }
      if (scheduleChanged) {
        routineService.savePlannerSchedule(updatedSchedule, state.splitName).catch(console.error);
      }

      return {
        routines: remaining,
        activeRoutineId: newActiveId,
        weeklySchedule: updatedSchedule,
      };
    });
  },

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
    routineService.saveRoutine(duplicated).catch(console.error);
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
        const updated = {
          ...r,
          exercises: reordered,
          updatedAt: Date.now(),
        };
        routineService.saveRoutine(updated).catch(console.error);
        return updated;
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
        const updated = {
          ...r,
          exercises: newExercises,
          estimatedDurationMin: calculateEstimatedDurationMin(newExercises),
          updatedAt: Date.now(),
        };
        routineService.saveRoutine(updated).catch(console.error);
        return updated;
      }),
    })),

  updateRoutineExercise: (routineId, exerciseId, updated) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== routineId) return r;
        const newExercises = r.exercises.map((e) =>
          e.id === exerciseId || e.exerciseId === exerciseId ? { ...e, ...updated } : e
        );
        const updatedRt = {
          ...r,
          exercises: newExercises,
          estimatedDurationMin: calculateEstimatedDurationMin(newExercises),
          updatedAt: Date.now(),
        };
        routineService.saveRoutine(updatedRt).catch(console.error);
        return updatedRt;
      }),
    })),

  removeExerciseFromRoutine: (routineId, exerciseId) =>
    set((state) => ({
      routines: state.routines.map((r) => {
        if (r.id !== routineId) return r;
        const filtered = r.exercises.filter((ex) => ex.id !== exerciseId && ex.exerciseId !== exerciseId);
        const reindexed = filtered.map((ex, idx) => ({ ...ex, order: idx + 1 }));
        const updated = {
          ...r,
          exercises: reindexed,
          estimatedDurationMin: calculateEstimatedDurationMin(reindexed),
          updatedAt: Date.now(),
        };
        routineService.saveRoutine(updated).catch(console.error);
        return updated;
      }),
    })),

  setDaySchedule: (dayOfWeek, routineId) => {
    set((state) => {
      const next = {
        ...state.weeklySchedule,
        [dayOfWeek]: routineId,
      };
      routineService.savePlannerSchedule(next, state.splitName).catch(console.error);
      return {
        weeklySchedule: next,
      };
    });
  },

  swapTodayRoutine: (routineId) => {
    const todayIndex = getCurrentDayIndex();
    get().setDaySchedule(todayIndex, routineId);
  },

  getScheduledRoutineForDay: (dayOfWeek) => {
    const { routines, weeklySchedule } = get();
    const routineId = weeklySchedule[dayOfWeek];
    if (!routineId) return null;
    // 1. First check user custom/saved routines in IndexedDB
    const userRoutine = routines.find((r) => r.id === routineId);
    if (userRoutine) return userRoutine;
    // 2. Check preset routines (if user assigned a built-in split template)
    const preset = PRESET_ROUTINES.find((r) => r.id === routineId);
    return preset || null;
  },

  getTodayScheduledRoutine: () => {
    const todayIndex = getCurrentDayIndex();
    return get().getScheduledRoutineForDay(todayIndex);
  },

  getRoutineById: (id) => {
    const { routines } = get();
    return routines.find((r) => r.id === id) || PRESET_ROUTINES.find((r) => r.id === id);
  },

  getActiveRoutine: () => {
    // Check if there is a scheduled routine for today first
    const todayRoutine = get().getTodayScheduledRoutine();
    if (todayRoutine) return todayRoutine;

    const { routines, activeRoutineId } = get();
    if (!routines || routines.length === 0) return undefined;
    return routines.find((r) => r.id === activeRoutineId) || routines[0];
  },

  resetToDefaults: () => {
    set({
      routines: [],
      activeRoutineId: '',
      weeklySchedule: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null },
      splitName: 'My Routine Planner',
      isHydrated: true,
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

