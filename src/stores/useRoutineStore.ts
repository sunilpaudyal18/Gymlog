import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Routine, RoutineExercise } from '../types';
import { PRESET_ROUTINES } from '../constants/routines';
import { calculateEstimatedDurationMin } from '../utils/workoutCalc';

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
  getRoutineById: (id: string) => Routine | undefined;
  getActiveRoutine: () => Routine | undefined;
  resetToDefaults: () => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
      routines: PRESET_ROUTINES,
      activeRoutineId: 'chest-triceps-focus',

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

  getRoutineById: (id) => get().routines.find((r) => r.id === id),

  getActiveRoutine: () => {
    const { routines, activeRoutineId } = get();
    return routines.find((r) => r.id === activeRoutineId) || routines[0];
  },

  resetToDefaults: () => {
    set({
      routines: PRESET_ROUTINES,
      activeRoutineId: 'chest-triceps-focus',
    });
  },
}),
    {
      name: 'gym_routines_store_v2',
      partialize: (state) => ({
        routines: state.routines,
        activeRoutineId: state.activeRoutineId,
      }),
    }
  )
);

