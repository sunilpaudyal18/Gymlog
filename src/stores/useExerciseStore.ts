import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Exercise, MuscleGroup, Equipment } from '../types';
import { PRESET_EXERCISES } from '../constants/exercises';

export interface EquipmentCategoryInfo {
  id: Equipment | 'all';
  label: string;
  count: number;
}

interface ExerciseState {
  exercises: Exercise[];
  searchQuery: string;
  selectedMuscleFilter: MuscleGroup | 'all';
  selectedEquipmentFilter: Equipment | 'all' | string;
  favorites: string[]; // exercise ids
  recentExerciseIds: string[];
  multiSelectedIds: string[];

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedMuscleFilter: (muscle: MuscleGroup | 'all') => void;
  setSelectedEquipmentFilter: (equipment: Equipment | 'all' | string) => void;
  toggleFavorite: (exerciseId: string) => void;
  isFavorite: (exerciseId: string) => boolean;
  toggleMultiSelect: (exerciseId: string) => void;
  clearMultiSelect: () => void;
  addRecentExercise: (exerciseId: string) => void;
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updated: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  getFilteredExercises: (muscleOverride?: MuscleGroup | 'all', equipmentOverride?: string | 'all') => Exercise[];
  getEquipmentCategoriesForMuscle: (muscle: MuscleGroup) => EquipmentCategoryInfo[];
}

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: PRESET_EXERCISES,
      searchQuery: '',
      selectedMuscleFilter: 'all',
      selectedEquipmentFilter: 'all',
      favorites: ['barbell-bench-press', 'incline-dumbbell-bench-press', 'barbell-back-squat', 'barbell-deadlift'],
      recentExerciseIds: ['barbell-bench-press', 'incline-dumbbell-bench-press', 'standing-cable-chest-fly', 'cable-rope-tricep-pushdown'],
      multiSelectedIds: [],

      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedMuscleFilter: (muscle) => set({ selectedMuscleFilter: muscle }),
      setSelectedEquipmentFilter: (equipment) => set({ selectedEquipmentFilter: equipment }),

      toggleFavorite: (exerciseId) =>
        set((state) => ({
          favorites: state.favorites.includes(exerciseId)
            ? state.favorites.filter((id) => id !== exerciseId)
            : [...state.favorites, exerciseId],
        })),

      isFavorite: (exerciseId) => get().favorites.includes(exerciseId),

      toggleMultiSelect: (exerciseId) =>
        set((state) => ({
          multiSelectedIds: state.multiSelectedIds.includes(exerciseId)
            ? state.multiSelectedIds.filter((id) => id !== exerciseId)
            : [...state.multiSelectedIds, exerciseId],
        })),

      clearMultiSelect: () => set({ multiSelectedIds: [] }),

      addRecentExercise: (exerciseId) =>
        set((state) => ({
          recentExerciseIds: [
            exerciseId,
            ...state.recentExerciseIds.filter((id) => id !== exerciseId),
          ].slice(0, 10),
        })),

      addExercise: (exercise) =>
        set((state) => ({
          exercises: [exercise, ...state.exercises.filter((e) => e.id !== exercise.id)],
        })),

      updateExercise: (id, updated) =>
        set((state) => ({
          exercises: state.exercises.map((e) => (e.id === id ? { ...e, ...updated } : e)),
        })),

      deleteExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
          favorites: state.favorites.filter((favId) => favId !== id),
        })),

      getExerciseById: (id) => {
        const { exercises } = get();
        return exercises.find(
          (e) =>
            e.id === id ||
            e.name.toLowerCase().replace(/\s+/g, '-') === id ||
            e.aliases?.some((a) => a.toLowerCase().replace(/\s+/g, '-') === id)
        );
      },

      // Dynamically compute equipment categories and actual counts for a given muscle group
      getEquipmentCategoriesForMuscle: (muscle: MuscleGroup) => {
        const { exercises } = get();
        const muscleExercises = exercises.filter((ex) => {
          if (muscle === 'legs') {
            return (
              ex.primaryMuscle === 'legs' ||
              ex.primaryMuscle === 'glutes' ||
              ex.primaryMuscle === 'calves' ||
              ex.secondaryMuscles?.includes('legs') ||
              ex.secondaryMuscles?.includes('glutes') ||
              ex.secondaryMuscles?.includes('calves')
            );
          }
          return ex.primaryMuscle === muscle || ex.secondaryMuscles?.includes(muscle);
        });

        const equipmentMap: Record<string, number> = {};
        muscleExercises.forEach((ex) => {
          equipmentMap[ex.equipment] = (equipmentMap[ex.equipment] || 0) + 1;
        });

        const equipmentLabels: Record<string, string> = {
          barbell: 'Barbell',
          dumbbells: 'Dumbbells',
          machine: 'Machine',
          cables: 'Cables',
          bodyweight: 'Bodyweight',
          smith_machine: 'Smith Machine',
          plate_loaded: 'Plate Loaded',
          ez_bar: 'EZ Bar',
          landmine: 'Landmine',
          resistance_band: 'Resistance Band',
          kettlebell: 'Kettlebell',
          trap_bar: 'Trap Bar',
          other: 'Specialty / Other',
        };

        const result: EquipmentCategoryInfo[] = [
          { id: 'all', label: 'All Categories', count: muscleExercises.length },
        ];

        // Priority ordering for cleaner UX
        const preferredOrder: Equipment[] = [
          'barbell',
          'dumbbells',
          'machine',
          'cables',
          'bodyweight',
          'smith_machine',
          'plate_loaded',
          'ez_bar',
          'landmine',
          'resistance_band',
          'kettlebell',
          'trap_bar',
          'other',
        ];

        preferredOrder.forEach((eq) => {
          if (equipmentMap[eq]) {
            result.push({
              id: eq,
              label: equipmentLabels[eq] || eq,
              count: equipmentMap[eq],
            });
          }
        });

        return result;
      },

      getFilteredExercises: (muscleOverride, equipmentOverride) => {
        const { exercises, searchQuery, selectedMuscleFilter, selectedEquipmentFilter } = get();
        const targetMuscle = muscleOverride !== undefined ? muscleOverride : selectedMuscleFilter;
        const targetEquipment = equipmentOverride !== undefined ? equipmentOverride : selectedEquipmentFilter;
        const query = searchQuery.toLowerCase().trim();

        // 1. Initial filter by muscle & equipment
        const matches = exercises.filter((ex) => {
          const matchMuscle =
            targetMuscle === 'all'
              ? true
              : targetMuscle === 'legs'
              ? ex.primaryMuscle === 'legs' ||
                ex.primaryMuscle === 'glutes' ||
                ex.primaryMuscle === 'calves' ||
                ex.secondaryMuscles?.includes('legs') ||
                ex.secondaryMuscles?.includes('glutes') ||
                ex.secondaryMuscles?.includes('calves')
              : ex.primaryMuscle === targetMuscle || ex.secondaryMuscles?.includes(targetMuscle);

          const matchEquipment =
            targetEquipment === 'all' || ex.equipment === targetEquipment;

          if (!matchMuscle || !matchEquipment) return false;
          if (!query) return true;

          const name = ex.name.toLowerCase();
          const muscle = ex.primaryMuscle.toLowerCase();
          const equip = ex.equipment.toLowerCase();
          const aliases = ex.aliases?.map((a) => a.toLowerCase()) || [];
          const terms = ex.searchableTerms?.map((t) => t.toLowerCase()) || [];
          const secMuscles = ex.secondaryMuscles?.map((m) => m.toLowerCase()) || [];

          return (
            name.includes(query) ||
            aliases.some((a) => a.includes(query)) ||
            muscle.includes(query) ||
            equip.includes(query) ||
            terms.some((t) => t.includes(query)) ||
            secMuscles.some((m) => m.includes(query))
          );
        });

        if (!query) return matches;

        // 2. Deterministic 7-Tier Ranked Scoring
        const scoreExercise = (ex: Exercise): number => {
          const name = ex.name.toLowerCase();
          const aliases = ex.aliases?.map((a) => a.toLowerCase()) || [];
          const terms = ex.searchableTerms?.map((t) => t.toLowerCase()) || [];
          const equip = ex.equipment.toLowerCase();
          const muscle = ex.primaryMuscle.toLowerCase();

          // Rank 1: Exact Name Match
          if (name === query) return 100;
          // Rank 2: Name starts with query
          if (name.startsWith(query)) return 85;
          // Rank 3: Name contains query
          if (name.includes(query)) return 70;
          // Rank 4: Alias exact or contains match
          if (aliases.some((a) => a === query)) return 65;
          if (aliases.some((a) => a.includes(query))) return 55;
          // Rank 5: Primary muscle match
          if (muscle.includes(query)) return 40;
          // Rank 6: Equipment match
          if (equip.includes(query)) return 30;
          // Rank 7: Searchable terms match
          if (terms.some((t) => t.includes(query))) return 20;

          return 10;
        };

        return matches.sort((a, b) => {
          const scoreA = scoreExercise(a);
          const scoreB = scoreExercise(b);
          if (scoreA !== scoreB) return scoreB - scoreA;
          return a.name.localeCompare(b.name);
        });
      },
    }),
    {
      name: 'gym_exercise_library_store_v2',
      partialize: (state) => ({
        exercises: state.exercises,
        favorites: state.favorites,
        recentExerciseIds: state.recentExerciseIds,
      }),
    }
  )
);
