import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Search,
  Plus,
  Trash2,
  Dumbbell,
  Coffee,
  CheckCircle2,
  Filter,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { MuscleGroup, Routine, RoutineExercise, Exercise } from '../../../types';
import { useRoutineStore } from '../../../stores/useRoutineStore';
import { useExerciseStore } from '../../../stores/useExerciseStore';
import { DAY_NAMES, REST_DAY_INFO } from '../../../utils/scheduler';
import {
  persistProtectedCustomExercise,
  removeProtectedCustomExercise,
  persistProtectedSavedRoutine,
  PROTECTED_STORAGE_KEYS,
} from '../../../services/storage/protectedStorage';

interface DayEditorDrawerProps {
  isOpen: boolean;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  initialRoutine: Routine | null;
  onClose: () => void;
  onSaved?: () => void;
}

// 1. STRICT UNIFIED MUSCLE TAXONOMY (Glutes permanently consolidated into Legs)
const MUSCLE_PILLS: { id: MuscleGroup; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'abs', label: 'Abs' },
  { id: 'forearms', label: 'Forearms' },
];

// Helper to normalize any muscle taxonomy to core 8 groups (Glutes & Calves map to Legs)
export const normalizeMuscle = (muscle: string | MuscleGroup): string => {
  if (muscle === 'glutes' || muscle === 'calves') return 'legs';
  return muscle;
};

// Bulletproof Exercise Filtering evaluating Target Muscles AND Text Search intersection
export const filterExercises = (
  catalog: Exercise[],
  query: string,
  scope: 'target_muscles' | 'all',
  targetMuscles: MuscleGroup[]
): Exercise[] => {
  const q = query.trim().toLowerCase();
  const normalizedTargets = targetMuscles.map(normalizeMuscle);

  return catalog.filter((ex) => {
    const normPrimary = normalizeMuscle(ex.primaryMuscle);

    // 1. Strict Target Muscle filter:
    // When target groups are restricted, an exercise MUST strictly belong to one of the active groups.
    if (scope === 'target_muscles' && normalizedTargets.length > 0) {
      const primaryMatches = normalizedTargets.includes(normPrimary);
      if (!primaryMatches) {
        return false;
      }
    }

    // 2. Text Search Query matching:
    if (q) {
      const nameMatches = ex.name.toLowerCase().includes(q);
      const muscleMatches = normPrimary.toLowerCase().includes(q);
      const equipmentMatches =
        ex.equipment &&
        ex.equipment !== 'other' &&
        ex.equipment.toLowerCase().replace('_', ' ').includes(q);
      const aliasMatches = ex.aliases?.some((a) => a.toLowerCase().includes(q));

      if (!nameMatches && !muscleMatches && !equipmentMatches && !aliasMatches) {
        return false;
      }
    }

    return true;
  });
};

export const DayEditorDrawer: React.FC<DayEditorDrawerProps> = ({
  isOpen,
  dayIndex,
  initialRoutine,
  onClose,
  onSaved,
}) => {
  const { setDayCustomRoutine, setDayRest } = useRoutineStore();
  const { exercises, addExercise, updateExercise, deleteExercise } = useExerciseStore();

  const dayName = DAY_NAMES[dayIndex] || 'Day';

  // Normalize initial routine's target muscles (mapping glutes to legs and deduplicating)
  const normalizedInitialMuscles = useMemo(() => {
    const raw = initialRoutine?.targetMuscles || ['chest', 'triceps'];
    const mapped = raw.map((m) => (m === 'glutes' || m === 'calves' ? 'legs' : m));
    return Array.from(new Set(mapped)) as MuscleGroup[];
  }, [initialRoutine]);

  // Local Form State
  const [isRestDay, setIsRestDay] = useState(initialRoutine === null);
  const [routineName, setRoutineName] = useState(initialRoutine?.name || `${dayName} Workout`);
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(normalizedInitialMuscles);
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    initialRoutine?.exercises || []
  );

  // Exercise Library Search & Dynamic Auto-Filtering Scope
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<'target_muscles' | 'all'>('target_muscles');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Inline Custom Exercise Creation State (Uncontaminated custom tags)
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>(
    selectedMuscles[0] || 'chest'
  );
  const [customAddedFeedback, setCustomAddedFeedback] = useState<string | null>(null);

  // Helper to check if an exercise is custom
  const isCustomItem = (exerciseId: string, itemObjId?: string): boolean => {
    if (exerciseId?.startsWith('custom-') || itemObjId?.startsWith('custom-')) return true;
    const match = exercises.find((e) => e.id === exerciseId || e.id === itemObjId);
    return !!match?.isCustom;
  };

  // Keep custom muscle category synced with active muscles if not manually set
  useEffect(() => {
    if (selectedMuscles.length > 0 && !selectedMuscles.includes(customMuscle)) {
      setCustomMuscle(selectedMuscles[0]);
    }
  }, [selectedMuscles, customMuscle]);

  // Reset or initialize state when dayIndex or initialRoutine changes
  useEffect(() => {
    if (initialRoutine) {
      setIsRestDay(false);
      setRoutineName(initialRoutine.name);
      const raw = initialRoutine.targetMuscles || ['chest'];
      const mapped = raw.map((m) => (m === 'glutes' || m === 'calves' ? 'legs' : m));
      setSelectedMuscles(Array.from(new Set(mapped)) as MuscleGroup[]);
      setSelectedExercises(initialRoutine.exercises || []);
    } else {
      setIsRestDay(true);
      setRoutineName(`${dayName} Workout`);
      setSelectedMuscles(['chest', 'triceps']);
      setSelectedExercises([]);
    }
    setSearchQuery('');
    setSaveSuccess(false);
    setFilterScope('target_muscles');
    setCustomExerciseName('');
    setCustomAddedFeedback(null);
  }, [dayIndex, initialRoutine, isOpen, dayName]);

  // SMART AUTO-FILTERING: Filter catalog using strict bulletproof intersection logic
  const filteredCatalog = useMemo(() => {
    return filterExercises(exercises, searchQuery, filterScope, selectedMuscles);
  }, [exercises, searchQuery, filterScope, selectedMuscles]);

  // Toggle muscle selection pill
  const toggleMuscle = (muscle: MuscleGroup) => {
    const norm = normalizeMuscle(muscle) as MuscleGroup;
    if (selectedMuscles.includes(norm)) {
      if (selectedMuscles.length > 1) {
        setSelectedMuscles(selectedMuscles.filter((m) => m !== norm));
      }
    } else {
      setSelectedMuscles([...selectedMuscles, norm]);
    }
    setFilterScope('target_muscles');
  };

  // Instant Toggle for adding/removing movements without modals
  const toggleExerciseInRoutine = (ex: Exercise) => {
    const isAdded = selectedExercises.some(
      (item) => item.exerciseId === ex.id || item.id === ex.id
    );

    if (isAdded) {
      setSelectedExercises((prev) =>
        prev
          .filter((item) => item.exerciseId !== ex.id && item.id !== ex.id)
          .map((item, idx) => ({ ...item, order: idx + 1 }))
      );
    } else {
      const normMuscle = normalizeMuscle(ex.primaryMuscle) as MuscleGroup;
      const newRoutineEx: RoutineExercise = {
        id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: normMuscle,
        equipment: ex.isCustom ? 'other' : ex.equipment,
        targetSets: ex.defaultSets || 3,
        targetReps: ex.defaultReps || '8-12',
        targetWeightKg: ex.defaultWeightKg || 20,
        restSeconds: ex.defaultRestSeconds || 90,
        order: selectedExercises.length + 1,
      };
      setSelectedExercises((prev) => [...prev, newRoutineEx]);
    }
  };

  // Exercise Sequence Reordering System: Effortlessly swap positions with up/down arrows
  const moveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedExercises.length) return;

    setSelectedExercises((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  // Instant Inline Custom Exercise Creator (Uncontaminated: adopts only selected muscle)
  const handleAddCustomExercise = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customExerciseName.trim();
    if (!trimmed) return;

    const newId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const targetMuscle = normalizeMuscle(customMuscle || selectedMuscles[0] || 'chest') as MuscleGroup;

    const newCustomEx: Exercise = {
      id: newId,
      name: trimmed,
      primaryMuscle: targetMuscle,
      equipment: 'other', // Clean uncontaminated tag without forcing unwanted "Dumbbells"
      category: 'compound',
      defaultSets: 3,
      defaultReps: '8-12',
      defaultRestSeconds: 90,
      defaultWeightKg: 20,
      isCustom: true,
    };

    // 1. Instantly inject into global exercise store
    addExercise(newCustomEx);

    // 2. Instantly inject into current day's routine
    const newRoutineEx: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: newCustomEx.id,
      exerciseName: newCustomEx.name,
      muscleGroup: newCustomEx.primaryMuscle,
      equipment: 'other',
      targetSets: 3,
      targetReps: '8-12',
      targetWeightKg: 20,
      restSeconds: 90,
      order: selectedExercises.length + 1,
    };

    setSelectedExercises((prev) => [...prev, newRoutineEx]);
    setCustomExerciseName('');
    setCustomAddedFeedback(`Added "${trimmed}" to routine!`);

    // Direct synchronous protected localStorage persistence
    persistProtectedCustomExercise(newCustomEx);

    setTimeout(() => setCustomAddedFeedback(null), 3000);
  };



  // Stepper helper for sets
  const updateExerciseSets = (reId: string, delta: number) => {
    setSelectedExercises((prev) =>
      prev.map((item) => {
        if (item.id === reId) {
          const newSets = Math.max(1, Math.min(10, item.targetSets + delta));
          return { ...item, targetSets: newSets };
        }
        return item;
      })
    );
  };

  // Stepper helper for reps
  const updateExerciseReps = (reId: string, newReps: string) => {
    setSelectedExercises((prev) =>
      prev.map((item) => (item.id === reId ? { ...item, targetReps: newReps } : item))
    );
  };

  // Remove movement directly
  const removeExercise = (reId: string) => {
    setSelectedExercises((prev) =>
      prev.filter((item) => item.id !== reId).map((item, idx) => ({ ...item, order: idx + 1 }))
    );
  };

  // Save Routine Action (Dual-Layer Protected Persistence)
  const handleSaveRoutine = () => {
    if (isRestDay) {
      setDayRest(dayIndex);
    } else {
      const savedRoutine = setDayCustomRoutine(dayIndex, {
        name: routineName.trim() || `${dayName} Workout`,
        targetMuscles: selectedMuscles.length > 0 ? selectedMuscles : ['chest'],
        exercises: selectedExercises,
      });
      // Save directly into protected saved routines storage
      persistProtectedSavedRoutine(savedRoutine);
    }

    // Record metadata sync timestamp
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('gym_last_offline_sync', String(Date.now()));
      }
    } catch (_) {}

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      if (onSaved) onSaved();
      onClose();
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col md:items-center md:justify-center md:p-6 overflow-hidden animate-fade-in">
      {/* Semi-transparent frosted backdrop overlay (Desktop only) */}
      <div
        className="hidden md:block fixed inset-0 transition-opacity"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          background: 'rgba(15, 23, 42, 0.45)',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Viewport Container:
          - Mobile (< 768px): Full-viewport immersive sub-page with fixed header & sticky footer
          - Desktop (>= 768px): Centered floating dialog window with frosted aesthetics
      */}
      <div
        className="relative w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] bg-[#F4F6F9] md:bg-white md:rounded-[28px] md:border flex flex-col z-10 select-none overflow-hidden"
        style={{
          boxShadow:
            '0 24px 60px -12px rgba(15, 23, 42, 0.28), 0 0 0 1px rgba(203, 213, 225, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Specular linear highlight along top edge (Desktop) */}
        <div className="hidden md:block absolute top-0 left-8 right-8 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* 1. FIXED TOP HEADER (Fixed on mobile & desktop, guaranteed never cut off) */}
        <div className="sticky top-0 z-20 shrink-0 p-4 sm:p-5 border-b border-[#E2E8F0] bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shadow-2xs">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#00A3A6]/10 text-[#00A3A6] border border-[#00A3A6]/25">
                {dayName}
              </span>
              <span className="text-xs text-[#94A3B8] font-medium truncate">
                Split Configuration
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] tracking-tight mt-0.5 truncate">
              Configure Split Routine
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#F1F5F9] hover:bg-[#E2E8F0] active:scale-95 text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-all cursor-pointer border border-[#CBD5E1]/60 shrink-0"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2. FLUID SCROLLABLE BODY (Touch-optimized scroll container, no nested scroll traps) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-5">
          {/* Day Mode Switcher (Active Training Day vs Full Rest Day) */}
          <div className="bg-[#E2E8F0]/70 p-1.5 rounded-2xl border border-[#CBD5E1]/70 flex items-center gap-1.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsRestDay(false)}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                !isRestDay
                  ? 'bg-white text-[#0F172A] shadow-sm border border-[#CBD5E1]/60 scale-[1.01]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Dumbbell
                size={16}
                className={!isRestDay ? 'text-[#00A3A6]' : 'text-[#94A3B8]'}
              />
              <span>Active Training Day</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRestDay(true)}
              className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isRestDay
                  ? 'bg-white text-[#0F172A] shadow-sm border border-[#CBD5E1]/60 scale-[1.01]'
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Coffee
                size={16}
                className={isRestDay ? 'text-[#00A3A6]' : 'text-[#94A3B8]'}
              />
              <span>Full Rest Day</span>
            </button>
          </div>

          {isRestDay ? (
            /* Rest Day State Description */
            <div className="rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/70 bg-white space-y-4 text-center shadow-xs">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00A3A6]/10 text-[#00A3A6] border border-[#00A3A6]/20 flex items-center justify-center">
                <Coffee size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  {REST_DAY_INFO[dayIndex]?.title || 'Full Rest & Recovery'}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  {REST_DAY_INFO[dayIndex]?.subtitle ||
                    'Prioritize hydration, mobility, and muscle tissue recovery between high-intensity lifting sessions.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsRestDay(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#00A3A6] bg-[#00A3A6]/10 hover:bg-[#00A3A6]/20 border border-[#00A3A6]/25 transition-all cursor-pointer min-h-[44px]"
                >
                  <Plus size={16} />
                  <span>Assign Workout to {dayName}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Active Training Day Configuration */
            <div className="space-y-5">
              {/* Routine Name Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="modal-routine-name-input"
                  className="text-xs font-bold uppercase tracking-wider text-[#475569] block"
                >
                  Routine Title
                </label>
                <input
                  id="modal-routine-name-input"
                  type="text"
                  value={routineName}
                  onChange={(e) => setRoutineName(e.target.value)}
                  placeholder="e.g. Chest + Triceps Focus"
                  className="w-full min-h-[48px] bg-white border border-[#CBD5E1] focus:border-[#00A3A6] focus:ring-2 focus:ring-[#00A3A6]/20 rounded-xl px-4 py-2.5 text-sm font-bold text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] shadow-2xs"
                />
              </div>

              {/* Target Muscles Selector (Strict 8 Core Groups - Glutes mapped into Legs) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Target Muscles (Smart Auto-Filter)
                  </span>
                  <span className="text-xs text-[#00A3A6] font-bold">
                    {selectedMuscles.length} active group{selectedMuscles.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {MUSCLE_PILLS.map((muscle) => {
                    const isSelected = selectedMuscles.includes(muscle.id);
                    return (
                      <button
                        key={muscle.id}
                        type="button"
                        onClick={() => toggleMuscle(muscle.id)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                          isSelected
                            ? 'bg-[#00A3A6] text-white shadow-sm shadow-[#00A3A6]/30 border border-[#00A3A6]'
                            : 'bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1]'
                        }`}
                      >
                        {isSelected && <Check size={13} className="stroke-[3]" />}
                        <span>{muscle.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Movements List with Unclamped Titles & Contextual Edit/Delete */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                    Assigned Exercises ({selectedExercises.length})
                  </span>
                  {selectedExercises.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedExercises([])}
                      className="text-xs font-bold text-[#EF4444] hover:underline cursor-pointer py-1 px-2"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedExercises.length === 0 ? (
                  <div className="rounded-2xl p-5 border border-dashed border-[#CBD5E1] text-center bg-white space-y-1">
                    <p className="text-xs font-bold text-[#64748B]">No exercises added to this day</p>
                    <p className="text-[11px] text-[#94A3B8]">
                      Search or use the quick custom creator below to add exercises.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedExercises.map((re, idx) => {
                      const displayMuscle = normalizeMuscle(re.muscleGroup);
                      const isCustom = isCustomItem(re.exerciseId, re.id);

                      return (
                        <div
                          key={re.id}
                          className="bg-white border border-[#CBD5E1] rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-2xs hover:border-[#00A3A6]/50 transition-all"
                        >
                          {/* Top Row: Order Badge, Unclamped Full Title, Custom Badge, Action Controls */}
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 border border-[#CBD5E1]/60">
                                {idx + 1}
                              </span>

                              {/* Unclamped Multi-Line Dynamic Wrapping Title */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-[#0F172A] leading-snug break-words">
                                  {re.exerciseName}
                                </h4>

                                  {/* Hierarchical Secondary Tags: Muscle, Equipment, Sets, Weight, Custom */}
                                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[10px] sm:text-[11px]">
                                    <span className="uppercase font-bold text-[#00A3A6] bg-[#00A3A6]/8 px-2 py-0.5 rounded-md border border-[#00A3A6]/20">
                                      {displayMuscle}
                                    </span>
                                    {re.equipment && re.equipment !== 'other' && (
                                      <span className="text-[#64748B] font-medium capitalize bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#CBD5E1]/50">
                                        {re.equipment.replace('_', ' ')}
                                      </span>
                                    )}
                                    <span className="text-[#64748B] font-medium bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#CBD5E1]/50">
                                      {re.targetSets} sets × {re.targetReps} reps
                                    </span>
                                    {re.targetWeightKg !== undefined && re.targetWeightKg > 0 && (
                                      <span className="text-[#64748B] font-medium bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#CBD5E1]/50">
                                        {re.targetWeightKg} kg
                                      </span>
                                    )}
                                    {isCustom && (
                                      <span className="text-[#00A3A6] font-extrabold uppercase text-[10px] bg-[#00A3A6]/12 px-2 py-0.5 rounded-md border border-[#00A3A6]/25">
                                        CUSTOM
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Right Action: Clean Remove from Routine only */}
                              <div className="flex items-center shrink-0 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => removeExercise(re.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 border border-[#CBD5E1]/60 transition-colors cursor-pointer active:scale-95"
                                  title="Remove exercise from day"
                                  aria-label="Remove exercise"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                          {/* Bottom Row / Hierarchical Secondary Info: Sequence Handles + Sets/Reps Controls */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9]">
                            {/* Sequence Shifting Handles (↑ / ↓) */}
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] font-semibold text-[#64748B] mr-1 hidden sm:inline">
                                Sequence:
                              </span>
                              <button
                                type="button"
                                onClick={() => moveExercise(idx, 'up')}
                                disabled={idx === 0}
                                className="w-8 h-7 flex items-center justify-center rounded-lg bg-[#F8FAFC] text-[#475569] hover:text-[#00A3A6] hover:bg-[#00A3A6]/10 disabled:opacity-20 disabled:hover:bg-[#F8FAFC] disabled:hover:text-[#475569] disabled:cursor-not-allowed transition-all cursor-pointer border border-[#CBD5E1]/70 active:scale-95"
                                title="Move exercise up"
                                aria-label="Move exercise up"
                              >
                                <ArrowUp size={13} className="stroke-[2.5]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveExercise(idx, 'down')}
                                disabled={idx === selectedExercises.length - 1}
                                className="w-8 h-7 flex items-center justify-center rounded-lg bg-[#F8FAFC] text-[#475569] hover:text-[#00A3A6] hover:bg-[#00A3A6]/10 disabled:opacity-20 disabled:hover:bg-[#F8FAFC] disabled:hover:text-[#475569] disabled:cursor-not-allowed transition-all cursor-pointer border border-[#CBD5E1]/70 active:scale-95"
                                title="Move exercise down"
                                aria-label="Move exercise down"
                              >
                                <ArrowDown size={13} className="stroke-[2.5]" />
                              </button>
                            </div>

                            {/* Sets / Reps Stepper Controls */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center border border-[#CBD5E1] rounded-xl bg-[#F8FAFC] overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateExerciseSets(re.id, -1)}
                                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] cursor-pointer active:scale-95"
                                  aria-label="Decrease sets"
                                >
                                  -
                                </button>
                                <span className="px-2 text-xs font-bold text-[#0F172A] min-w-[32px] text-center">
                                  {re.targetSets}s
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateExerciseSets(re.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] cursor-pointer active:scale-95"
                                  aria-label="Increase sets"
                                >
                                  +
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={re.targetReps}
                                  onChange={(e) => updateExerciseReps(re.id, e.target.value)}
                                  placeholder="8-12"
                                  className="w-16 h-8 text-center text-xs font-bold text-[#0F172A] border border-[#CBD5E1] rounded-xl bg-[#F8FAFC] outline-none focus:border-[#00A3A6] focus:ring-1 focus:ring-[#00A3A6]/20"
                                  title="Target repetitions"
                                />
                                <span className="text-[11px] text-[#94A3B8] font-bold">reps</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Dynamic Exercise Library & Search Controls */}
              <div className="space-y-3 pt-3 border-t border-[#CBD5E1]">
                {/* Search & Filter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                      Exercise Library & Quick Add
                    </h3>
                    <p className="text-[11px] text-[#00A3A6] font-bold mt-0.5">
                      {filterScope === 'target_muscles'
                        ? `Auto-filtered to active target: ${selectedMuscles.join(', ')}`
                        : 'Showing all movements across catalog'}
                    </p>
                  </div>

                  {/* Filter Scope Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setFilterScope(filterScope === 'target_muscles' ? 'all' : 'target_muscles')
                    }
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 border shrink-0 ${
                      filterScope === 'all'
                        ? 'bg-[#00A3A6]/10 text-[#00A3A6] border-[#00A3A6]/30 shadow-xs'
                        : 'bg-white text-[#475569] border-[#CBD5E1] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <Filter size={14} className="text-[#00A3A6]" />
                    <span>
                      {filterScope === 'target_muscles' ? 'Show All Muscles' : 'Target Muscles Only'}
                    </span>
                  </button>
                </div>

                {/* Unconstrained Real-Time Search Bar */}
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search exercise library by name or equipment..."
                    className="w-full min-h-[48px] bg-white border border-[#CBD5E1] focus:border-[#00A3A6] focus:ring-2 focus:ring-[#00A3A6]/20 rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] shadow-2xs"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#E2E8F0] hover:bg-[#CBD5E1] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* INLINE CUSTOM EXERCISE CREATOR (Uncontaminated: Binds ONLY to chosen muscle) */}
                <form
                  onSubmit={handleAddCustomExercise}
                  className="bg-white rounded-2xl border border-[#CBD5E1] p-3 shadow-2xs space-y-2.5 transition-all focus-within:border-[#00A3A6] focus-within:ring-2 focus-within:ring-[#00A3A6]/20"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#00A3A6]/10 text-[#00A3A6] flex items-center justify-center shrink-0">
                      <Plus size={18} className="stroke-[2.5]" />
                    </div>
                    <input
                      type="text"
                      value={customExerciseName}
                      onChange={(e) => setCustomExerciseName(e.target.value)}
                      placeholder="+ Type custom exercise name (e.g., Chest Supported Row)..."
                      className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
                    />
                    <button
                      type="submit"
                      disabled={!customExerciseName.trim()}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#00A3A6] text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#008B8E] active:scale-95 transition-all shrink-0 cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Plus size={15} className="stroke-[3]" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Muscle Category Selector & Instant Feedback (Only Core 8 Groups, No Unwanted Equipment) */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748B] font-semibold">Muscle category:</span>
                      <select
                        value={customMuscle}
                        onChange={(e) => setCustomMuscle(normalizeMuscle(e.target.value) as MuscleGroup)}
                        className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-lg px-2.5 py-1 text-[#0F172A] font-bold text-xs outline-none cursor-pointer"
                      >
                        {MUSCLE_PILLS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {customAddedFeedback ? (
                      <span className="text-[#00A3A6] font-bold flex items-center gap-1 animate-fade-in text-xs">
                        <CheckCircle2 size={14} className="stroke-[2.5]" />
                        <span>{customAddedFeedback}</span>
                      </span>
                    ) : (
                      <span className="text-[#94A3B8] font-medium hidden sm:inline">
                        Pure muscle binding • Offline persistent
                      </span>
                    )}
                  </div>
                </form>

                {/* Fluid Exercise Catalog List with Clean 56px+ Touch Targets & Contextual Controls */}
                <div className="border border-[#CBD5E1] rounded-2xl bg-white divide-y divide-[#F1F5F9] max-h-72 sm:max-h-80 overflow-y-auto shadow-2xs">
                  {filteredCatalog.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#94A3B8] space-y-2">
                      <p className="font-semibold text-[#64748B]">
                        No exercises found matching "{searchQuery || 'current filters'}".
                      </p>
                      <p className="text-[11px]">
                        Use the custom creator above to add it, or toggle all muscles.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('');
                          setFilterScope('all');
                        }}
                        className="inline-block mt-1 text-[#00A3A6] font-bold underline cursor-pointer"
                      >
                        Reset filters to browse all movements
                      </button>
                    </div>
                  ) : (
                    filteredCatalog.map((ex) => {
                      const isSelected = selectedExercises.some(
                        (re) => re.exerciseId === ex.id || re.id === ex.id
                      );
                      const displayMuscle = normalizeMuscle(ex.primaryMuscle);
                      const isCustom = ex.isCustom;

                      return (
                        <div key={ex.id} className="flex flex-col">
                          <div
                            onClick={() => toggleExerciseInRoutine(ex)}
                            className={`p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[56px] ${
                              isSelected ? 'bg-[#00A3A6]/8' : 'hover:bg-[#F8FAFC]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Instant Toggle Checkbox (#00A3A6) */}
                              <div
                                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all shrink-0 ${
                                  isSelected
                                    ? 'bg-[#00A3A6] border-[#00A3A6] text-white shadow-xs'
                                    : 'border-[#CBD5E1] bg-white'
                                }`}
                              >
                                {isSelected && <Check size={14} className="stroke-[3]" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <h4
                                  className={`text-xs sm:text-sm font-bold leading-snug break-words ${
                                    isSelected ? 'text-[#00A3A6]' : 'text-[#0F172A]'
                                  }`}
                                >
                                  {ex.name}
                                </h4>
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] text-[#64748B] font-medium mt-1">
                                  <span className="uppercase font-bold text-[#00A3A6] bg-[#00A3A6]/8 px-1.5 py-0.5 rounded border border-[#00A3A6]/20">
                                    {displayMuscle}
                                  </span>
                                  {ex.equipment && ex.equipment !== 'other' && (
                                    <span className="capitalize bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60">
                                      {ex.equipment.replace('_', ' ')}
                                    </span>
                                  )}
                                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60">
                                    {ex.defaultSets || 3} sets
                                  </span>
                                  {isCustom && (
                                    <span className="text-[#00A3A6] font-extrabold uppercase text-[9px] tracking-wider bg-[#00A3A6]/12 px-1.5 py-0.5 rounded border border-[#00A3A6]/25 shrink-0">
                                      CUSTOM
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Right Side: Prominent + ADD / Checked Action Button */}
                            <div className="flex items-center shrink-0 ml-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExerciseInRoutine(ex);
                                }}
                                className={`min-h-[38px] min-w-[70px] px-2.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1 active:scale-95 ${
                                  isSelected
                                    ? 'bg-[#00A3A6] text-white shadow-xs shadow-[#00A3A6]/30'
                                    : 'bg-[#00A3A6]/10 text-[#00A3A6] border border-[#00A3A6]/25 hover:bg-[#00A3A6] hover:text-white'
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check size={14} className="stroke-[3]" />
                                    <span>Added</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={14} className="stroke-[3]" />
                                    <span>+ Add</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. STICKY ACTION FOOTER (Pinned to bottom on mobile, never cut off by keyboards/navbars) */}
        <div className="sticky bottom-0 z-20 shrink-0 p-4 sm:p-5 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md flex items-center justify-between gap-3 shadow-sm pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[48px] py-3 px-5 rounded-xl border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] text-xs font-bold transition-all cursor-pointer shrink-0 active:scale-95"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveRoutine}
            className={`flex-1 min-h-[48px] py-3 px-6 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99] ${
              saveSuccess
                ? 'bg-[#10B981] shadow-[#10B981]/25'
                : 'bg-[#00A3A6] hover:bg-[#008B8E] active:bg-[#007A7C] shadow-[#00A3A6]/30 hover:scale-[1.01]'
            }`}
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 size={18} className="stroke-[2.5]" />
                <span>Saved & Synchronized</span>
              </>
            ) : (
              <>
                <Check size={18} className="stroke-[2.5]" />
                <span>Save Routine</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
