import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  Search,
  Plus,
  Trash2,
  Dumbbell,
  Sparkles,
  Coffee,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { MuscleGroup, Routine, RoutineExercise, Exercise } from '../../../types';
import { useRoutineStore } from '../../../stores/useRoutineStore';
import { useExerciseStore } from '../../../stores/useExerciseStore';
import { DAY_NAMES, REST_DAY_INFO } from '../../../utils/scheduler';

interface DayEditorDrawerProps {
  isOpen: boolean;
  dayIndex: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  initialRoutine: Routine | null;
  onClose: () => void;
  onSaved?: () => void;
}

const MUSCLE_PILLS: { id: MuscleGroup; label: string }[] = [
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'legs', label: 'Legs' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'abs', label: 'Abs' },
  { id: 'glutes', label: 'Glutes' },
  { id: 'forearms', label: 'Forearms' },
];

interface QuickTemplate {
  name: string;
  badge: string;
  muscles: MuscleGroup[];
  defaultExerciseNames: string[];
}

const DAY_TEMPLATES: QuickTemplate[] = [
  {
    name: 'Chest + Triceps (Push Focus)',
    badge: 'Push',
    muscles: ['chest', 'triceps'],
    defaultExerciseNames: [
      'Bench Press',
      'Incline Dumbbell Press',
      'Cable Fly',
      'Rope Pushdown',
      'Dips',
    ],
  },
  {
    name: 'Back + Biceps (Pull Focus)',
    badge: 'Pull',
    muscles: ['back', 'biceps'],
    defaultExerciseNames: [
      'Barbell Deadlift',
      'Barbell Row',
      'Lat Pulldown',
      'Incline Dumbbell Curl',
      'Face Pull',
    ],
  },
  {
    name: 'Legs & Calves (Lower Focus)',
    badge: 'Legs',
    muscles: ['legs', 'glutes'],
    defaultExerciseNames: [
      'Barbell Back Squat',
      'Romanian Deadlift',
      'Leg Press',
      'Standing Calf Raise',
      'Walking Lunges',
    ],
  },
  {
    name: 'Shoulders & Arms Hypertrophy',
    badge: 'Arms',
    muscles: ['shoulders', 'biceps', 'triceps'],
    defaultExerciseNames: [
      'Overhead Press',
      'Lateral Raise',
      'Barbell Curl',
      'Overhead Tricep Extension',
    ],
  },
  {
    name: 'Full Body Classic Stimulus',
    badge: 'Full Body',
    muscles: ['chest', 'back', 'legs'],
    defaultExerciseNames: [
      'Barbell Back Squat',
      'Bench Press',
      'Barbell Row',
      'Overhead Press',
    ],
  },
  {
    name: 'Core & Abdominal Conditioning',
    badge: 'Core',
    muscles: ['abs'],
    defaultExerciseNames: [
      'Hanging Leg Raise',
      'Cable Crunch',
      'Plank Hold',
      'Ab Wheel Rollout',
    ],
  },
];

export const DayEditorDrawer: React.FC<DayEditorDrawerProps> = ({
  isOpen,
  dayIndex,
  initialRoutine,
  onClose,
  onSaved,
}) => {
  const { setDayCustomRoutine, setDayRest } = useRoutineStore();
  const { exercises, addExercise } = useExerciseStore();

  const dayName = DAY_NAMES[dayIndex] || 'Day';

  // Local Form State
  const [isRestDay, setIsRestDay] = useState(initialRoutine === null);
  const [routineName, setRoutineName] = useState(initialRoutine?.name || `${dayName} Workout`);
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>(
    initialRoutine?.targetMuscles || ['chest', 'triceps']
  );
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>(
    initialRoutine?.exercises || []
  );

  // Exercise Library Search & Dynamic Auto-Filtering Scope
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScope, setFilterScope] = useState<'target_muscles' | 'all'>('target_muscles');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Inline Custom Exercise Creation State
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroup>(selectedMuscles[0] || 'chest');
  const [customAddedFeedback, setCustomAddedFeedback] = useState<string | null>(null);

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
      setSelectedMuscles(initialRoutine.targetMuscles || ['chest']);
      setSelectedExercises(initialRoutine.exercises || []);
    } else {
      setIsRestDay(true);
      setRoutineName(`${dayName} Workout`);
      setSelectedMuscles(['chest', 'triceps']);
      setSelectedExercises([]);
    }
    setSearchQuery('');
    setSaveSuccess(false);
    setShowTemplates(false);
    setFilterScope('target_muscles');
    setCustomExerciseName('');
    setCustomAddedFeedback(null);
  }, [dayIndex, initialRoutine, isOpen, dayName]);

  // SMART AUTO-FILTERING: Filter exercise catalog dynamically based on active selected target muscles
  const filteredCatalog = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return exercises.filter((ex) => {
      // 1. Text search matching across name, muscle, equipment, and aliases
      const matchesSearch =
        !q ||
        ex.name.toLowerCase().includes(q) ||
        ex.primaryMuscle.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        ex.aliases?.some((a) => a.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // 2. Dynamic Target Muscle auto-filtering
      if (filterScope === 'target_muscles' && selectedMuscles.length > 0) {
        const matchesPrimary = selectedMuscles.includes(ex.primaryMuscle);
        const matchesSecondary = ex.secondaryMuscles?.some((sm) =>
          selectedMuscles.includes(sm)
        );
        return matchesPrimary || matchesSecondary;
      }

      return true;
    });
  }, [exercises, searchQuery, filterScope, selectedMuscles]);

  // Toggle muscle selection pill
  const toggleMuscle = (muscle: MuscleGroup) => {
    if (selectedMuscles.includes(muscle)) {
      if (selectedMuscles.length > 1) {
        setSelectedMuscles(selectedMuscles.filter((m) => m !== muscle));
      }
    } else {
      setSelectedMuscles([...selectedMuscles, muscle]);
    }
    // Automatically keep filter focused on active target muscles
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
      const newRoutineEx: RoutineExercise = {
        id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: ex.id,
        exerciseName: ex.name,
        muscleGroup: ex.primaryMuscle,
        equipment: ex.equipment,
        targetSets: ex.defaultSets || 3,
        targetReps: ex.defaultReps || '8-12',
        targetWeightKg: ex.defaultWeightKg || 20,
        restSeconds: ex.defaultRestSeconds || 90,
        order: selectedExercises.length + 1,
      };
      setSelectedExercises((prev) => [...prev, newRoutineEx]);
    }
  };

  // Instant Inline Custom Exercise Creator
  const handleAddCustomExercise = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customExerciseName.trim();
    if (!trimmed) return;

    const newId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const targetMuscle = customMuscle || selectedMuscles[0] || 'chest';

    const newCustomEx: Exercise = {
      id: newId,
      name: trimmed,
      primaryMuscle: targetMuscle,
      equipment: 'dumbbells',
      category: 'compound',
      defaultSets: 3,
      defaultReps: '8-12',
      defaultRestSeconds: 90,
      defaultWeightKg: 20,
      isCustom: true,
    };

    // 1. Instantly inject into global exercise store & persistent storage
    addExercise(newCustomEx);

    // 2. Instantly inject into current day's routine
    const newRoutineEx: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: newCustomEx.id,
      exerciseName: newCustomEx.name,
      muscleGroup: newCustomEx.primaryMuscle,
      equipment: newCustomEx.equipment,
      targetSets: 3,
      targetReps: '8-12',
      targetWeightKg: 20,
      restSeconds: 90,
      order: selectedExercises.length + 1,
    };

    setSelectedExercises((prev) => [...prev, newRoutineEx]);
    setCustomExerciseName('');
    setCustomAddedFeedback(`Added "${trimmed}" to routine!`);
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

  // 1-Tap Quick Template Selection
  const handleSelectTemplate = (template: QuickTemplate) => {
    setIsRestDay(false);
    setRoutineName(template.name);
    setSelectedMuscles(template.muscles);

    // Map template exercise names to real catalog exercises
    const matchedExercises: RoutineExercise[] = [];
    template.defaultExerciseNames.forEach((targetName, idx) => {
      const match = exercises.find(
        (e) =>
          e.name.toLowerCase() === targetName.toLowerCase() ||
          e.name.toLowerCase().includes(targetName.toLowerCase())
      );
      if (match) {
        matchedExercises.push({
          id: `re-tmpl-${Date.now()}-${idx}`,
          exerciseId: match.id,
          exerciseName: match.name,
          muscleGroup: match.primaryMuscle,
          equipment: match.equipment,
          targetSets: match.defaultSets || 3,
          targetReps: match.defaultReps || '8-12',
          targetWeightKg: match.defaultWeightKg || 25,
          restSeconds: match.defaultRestSeconds || 90,
          order: idx + 1,
        });
      }
    });

    if (matchedExercises.length > 0) {
      setSelectedExercises(matchedExercises);
    }
    setFilterScope('target_muscles');
    setShowTemplates(false);
  };

  // Save Routine Action (Dual-Layer Offline Persistence)
  const handleSaveRoutine = () => {
    if (isRestDay) {
      setDayRest(dayIndex);
    } else {
      setDayCustomRoutine(dayIndex, {
        name: routineName.trim() || `${dayName} Workout`,
        targetMuscles: selectedMuscles.length > 0 ? selectedMuscles : ['chest'],
        exercises: selectedExercises,
      });
    }

    // Direct synchronous localStorage snapshot for guaranteed offline persistence
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const offlineSnapshot = {
          dayIndex,
          dayName,
          isRestDay,
          routineName: routineName.trim() || `${dayName} Workout`,
          targetMuscles: selectedMuscles,
          exercisesCount: selectedExercises.length,
          timestamp: Date.now(),
        };
        localStorage.setItem(`gym_day_${dayIndex}_saved`, JSON.stringify(offlineSnapshot));
        localStorage.setItem('gym_last_offline_sync', String(Date.now()));
      }
    } catch (e) {
      console.warn('Direct localStorage backup wrote with fallback', e);
    }

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

        {/* 2. FLUID SCROLLABLE BODY (Touch-optimized scroll container) */}
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
              {/* Quick Preset Templates Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#00A3A6]" />
                    <span>Quick Templates (1-Tap Setup)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs font-bold text-[#00A3A6] hover:text-[#008B8E] cursor-pointer py-1 px-2 rounded-lg"
                  >
                    {showTemplates ? 'Hide Templates' : 'Browse Templates'}
                  </button>
                </div>

                {showTemplates && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-2xl bg-white border border-[#CBD5E1]/70 shadow-xs animate-fade-in">
                    {DAY_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.name}
                        type="button"
                        onClick={() => handleSelectTemplate(tmpl)}
                        className="text-left p-3 rounded-xl bg-[#F8FAFC] hover:bg-[#00A3A6]/5 border border-[#CBD5E1]/60 hover:border-[#00A3A6] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#0F172A] group-hover:text-[#00A3A6] truncate">
                            {tmpl.name}
                          </span>
                          <span className="text-[10px] font-black uppercase text-[#00A3A6] bg-[#00A3A6]/10 px-1.5 py-0.5 rounded">
                            {tmpl.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#94A3B8] mt-1 truncate">
                          {tmpl.defaultExerciseNames.slice(0, 3).join(', ')}...
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

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

              {/* Target Muscles Selector (Pill Selection with signature Electric Teal) */}
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

              {/* Assigned Movements List */}
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
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {selectedExercises.map((re, idx) => (
                      <div
                        key={re.id}
                        className="bg-white border border-[#CBD5E1] rounded-2xl p-3 flex items-center justify-between gap-2 shadow-2xs hover:border-[#00A3A6]/50 transition-all min-h-[56px]"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-extrabold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-[#0F172A] block truncate">
                              {re.exerciseName}
                            </span>
                            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold">
                              {re.equipment} • {re.muscleGroup}
                            </span>
                          </div>
                        </div>

                        {/* Sets / Reps Stepper Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <div className="flex items-center border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateExerciseSets(re.id, -1)}
                              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] cursor-pointer"
                              aria-label="Decrease sets"
                            >
                              -
                            </button>
                            <span className="px-1.5 text-xs font-bold text-[#0F172A] min-w-[28px] text-center">
                              {re.targetSets}s
                            </span>
                            <button
                              type="button"
                              onClick={() => updateExerciseSets(re.id, 1)}
                              className="w-8 h-8 flex items-center justify-center text-sm font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] cursor-pointer"
                              aria-label="Increase sets"
                            >
                              +
                            </button>
                          </div>

                          <input
                            type="text"
                            value={re.targetReps}
                            onChange={(e) => updateExerciseReps(re.id, e.target.value)}
                            placeholder="8-12"
                            className="w-14 h-8 text-center text-xs font-bold text-[#0F172A] border border-[#CBD5E1] rounded-lg bg-[#F8FAFC] outline-none focus:border-[#00A3A6]"
                            title="Target repetitions"
                          />

                          <button
                            type="button"
                            onClick={() => removeExercise(re.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                            title="Remove exercise"
                            aria-label="Remove exercise"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
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

                {/* INLINE CUSTOM EXERCISE CREATOR ("Add Custom" persistent quick-add banner) */}
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

                  {/* Muscle Category Selector & Instant Feedback for Custom Movement */}
                  <div className="flex items-center justify-between text-[11px] pt-2 border-t border-[#F1F5F9]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#64748B] font-semibold">Muscle group:</span>
                      <select
                        value={customMuscle}
                        onChange={(e) => setCustomMuscle(e.target.value as MuscleGroup)}
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
                        Instantly injects into routine & library
                      </span>
                    )}
                  </div>
                </form>

                {/* Fluid Exercise Catalog List with Clean 56px+ Touch Targets & Electric Teal Feedback */}
                <div className="border border-[#CBD5E1] rounded-2xl bg-white divide-y divide-[#F1F5F9] max-h-64 sm:max-h-72 overflow-y-auto shadow-2xs">
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

                      return (
                        <div
                          key={ex.id}
                          onClick={() => toggleExerciseInRoutine(ex)}
                          className={`p-3.5 flex items-center justify-between gap-3 transition-all cursor-pointer min-h-[56px] ${
                            isSelected ? 'bg-[#00A3A6]/8' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
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

                            <div className="min-w-0">
                              <span
                                className={`text-xs sm:text-sm font-bold block truncate ${
                                  isSelected ? 'text-[#00A3A6]' : 'text-[#0F172A]'
                                }`}
                              >
                                {ex.name}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#94A3B8] font-semibold mt-0.5">
                                <span className="uppercase font-bold text-[#00A3A6]">
                                  {ex.primaryMuscle}
                                </span>
                                <span>•</span>
                                <span className="capitalize">{ex.equipment.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{ex.defaultSets || 3} sets</span>
                                {ex.isCustom && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#D96B27] font-bold uppercase text-[9px]">Custom</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Prominent + ADD / Checked Action Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExerciseInRoutine(ex);
                            }}
                            className={`min-h-[44px] min-w-[76px] px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1 active:scale-95 ${
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
