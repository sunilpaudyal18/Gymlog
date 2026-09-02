import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  MoreVertical,
  Minus,
  Plus,
  Heart,
  BookOpen,
  Check,
  Clock,
  Dumbbell,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { AddToRoutineModal } from './components/AddToRoutineModal';
import { Exercise, RoutineExercise } from '../../types';

export const ExerciseDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { exerciseId, id } = useParams<{ exerciseId?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');

  const targetId = exerciseId || id || '';

  const { getExerciseById, exercises, isFavorite, toggleFavorite, addRecentExercise } = useExerciseStore();
  const { routines, addExerciseToRoutine } = useRoutineStore();

  // 1. Resolve exercise definition from exercise store
  let exercise = targetId ? getExerciseById(targetId) : undefined;

  // 2. If not found in exercise store, check if it exists in the active/selected routine
  const targetRoutine = routineId ? routines.find((r) => r.id === routineId) : undefined;
  const existingRoutineEx = targetRoutine?.exercises.find(
    (e) => e.exerciseId === targetId || e.id === targetId
  );

  if (!exercise && existingRoutineEx) {
    exercise = {
      id: existingRoutineEx.exerciseId || existingRoutineEx.id,
      name: existingRoutineEx.exerciseName,
      primaryMuscle: existingRoutineEx.muscleGroup,
      equipment: existingRoutineEx.equipment,
      category: 'compound',
      defaultSets: existingRoutineEx.targetSets || 3,
      defaultReps: existingRoutineEx.targetReps || '8-12',
      defaultWeightKg: existingRoutineEx.targetWeightKg || 30,
      defaultRestSeconds: existingRoutineEx.restSeconds || 90,
      instructions: ['Perform movement with controlled cadence and proper form.'],
      imageUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
    };
  }

  // 3. Fallback to first available exercise if no id was provided at all
  if (!exercise && !targetId && exercises.length > 0) {
    exercise = exercises[0];
  }

  const [sets, setSets] = useState(existingRoutineEx?.targetSets || exercise?.defaultSets || 3);
  const [reps, setReps] = useState(existingRoutineEx?.targetReps || exercise?.defaultReps || '8-12');
  const [weightKg, setWeightKg] = useState(existingRoutineEx?.targetWeightKg || exercise?.defaultWeightKg || 32.5);
  const [restSeconds, setRestSeconds] = useState(existingRoutineEx?.restSeconds || exercise?.defaultRestSeconds || 90);
  const [notes, setNotes] = useState(existingRoutineEx?.notes || '');
  const [showRoutinePicker, setShowRoutinePicker] = useState(false);

  useEffect(() => {
    if (existingRoutineEx) {
      setSets(existingRoutineEx.targetSets || 3);
      setReps(existingRoutineEx.targetReps || '8-12');
      setWeightKg(existingRoutineEx.targetWeightKg || 32.5);
      setRestSeconds(existingRoutineEx.restSeconds || 90);
      setNotes(existingRoutineEx.notes || '');
    } else if (exercise) {
      setSets(exercise.defaultSets || 3);
      setReps(exercise.defaultReps || '8-12');
      setWeightKg(exercise.defaultWeightKg || 32.5);
      setRestSeconds(exercise.defaultRestSeconds || 90);
    }
  }, [existingRoutineEx, exercise]);

  if (!exercise) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4 select-none">
        <p className="text-[#475569]">Exercise not found.</p>
        <button
          onClick={() => navigate('/exercises')}
          className="bg-[#008B8E] text-white font-bold px-4 py-2 rounded-xl shadow-sm cursor-pointer"
        >
          Back to Exercises
        </button>
      </div>
    );
  }

  const formatRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdjustWeight = (delta: number) => {
    setWeightKg((prev) => {
      const updated = Math.max(0, Number((prev + delta).toFixed(1)));
      return updated;
    });
  };

  const handleAdjustRest = (delta: number) => {
    setRestSeconds((prev) => Math.max(15, Math.min(600, prev + delta)));
  };

  const handleAddAction = () => {
    addRecentExercise(exercise.id);

    if (routineId) {
      const newEx: RoutineExercise = {
        id: existingRoutineEx?.id || 're-' + Date.now(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.primaryMuscle,
        equipment: exercise.equipment,
        targetSets: sets,
        targetReps: reps,
        targetWeightKg: weightKg,
        restSeconds: restSeconds,
        notes: notes,
        order: existingRoutineEx?.order || 99,
      };
      addExerciseToRoutine(routineId, newEx);
      navigate(`/routine-preview/${routineId}`);
    } else {
      setShowRoutinePicker(true);
    }
  };

  const handleBack = () => {
    if (routineId) {
      navigate(`/routine-preview/${routineId}`);
    } else {
      navigate(-1);
    }
  };

  const isFav = isFavorite(exercise.id);

  const repPresets = ['5', '6-8', '8-10', '8-12', '10-12', '12-15', '15-20'];
  const restPresets = [45, 60, 90, 120, 150, 180];

  return (
    <div className="flex flex-col px-4 pt-3 pb-24 space-y-4 animate-fade-in select-none max-w-[480px] w-full mx-auto box-border">
      {/* 1. Top Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm active:scale-95"
          aria-label="Back"
        >
          <ChevronLeft size={20} />
        </button>

        <h1 className="text-sm font-bold text-[#0F172A] tracking-wider uppercase text-center truncate max-w-[220px]">
          {exercise.name}
        </h1>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleFavorite(exercise.id)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95 ${
              isFav
                ? 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30'
                : 'text-[#64748B] hover:text-[#0F172A] bg-white border border-[#CBD5E1]'
            }`}
            aria-label="Favorite"
          >
            <Heart size={18} className={isFav ? 'fill-current' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Primary Classification Badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-white bg-[#008B8E] px-2.5 py-1 rounded-full shadow-xs">
          {exercise.primaryMuscle}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F172A] bg-slate-100 border border-[#CBD5E1] px-2.5 py-1 rounded-full capitalize">
          {exercise.equipment.replace(/_/g, ' ')}
        </span>
        <span className="text-[11px] font-semibold text-[#475569] bg-white border border-[#CBD5E1] px-2.5 py-1 rounded-full capitalize">
          {exercise.category}
        </span>
        {exercise.difficulty && (
          <span className="text-[11px] font-semibold text-[#D96B27] bg-[#D96B27]/10 border border-[#D96B27]/30 px-2.5 py-1 rounded-full capitalize">
            {exercise.difficulty}
          </span>
        )}
      </div>

      {/* 3. Aliases Bar (if available) */}
      {exercise.aliases && exercise.aliases.length > 0 && (
        <div className="bg-white/80 border border-[#CBD5E1] rounded-xl p-2.5 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] shrink-0">
            Also known as:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {exercise.aliases.slice(0, 3).map((alias, idx) => (
              <span
                key={idx}
                className="text-[11px] text-[#0F172A] font-medium bg-slate-100 px-2 py-0.5 rounded-lg border border-[#CBD5E1]/70"
              >
                {alias}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. CONFIGURE WORKOUT VARIABLES */}
      <div className="space-y-3 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
          CONFIGURE WORKOUT VARIABLES
        </span>

        {/* Target Sets Stepper */}
        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 flex items-center justify-between shadow-sm backdrop-blur-md">
          <div>
            <span className="text-sm font-bold text-[#0F172A] block">Target Sets</span>
            <span className="text-[11px] text-[#475569] font-medium">Working volume sets</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSets(Math.max(1, sets - 1))}
              className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Decrease sets"
            >
              <Minus size={18} />
            </button>
            <span className="font-mono-metric font-bold text-xl text-[#0F172A] min-w-[28px] text-center">
              {sets}
            </span>
            <button
              type="button"
              onClick={() => setSets(sets + 1)}
              className="w-10 h-10 rounded-xl bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Increase sets"
            >
              <Plus size={18} className="stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Target Reps Stepper & Presets */}
        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-[#0F172A] block">Target Reps</span>
              <span className="text-[11px] text-[#475569] font-medium">Repetition target range</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const idx = repPresets.indexOf(reps);
                  if (idx > 0) setReps(repPresets[idx - 1]);
                  else if (idx === -1) setReps(repPresets[0]);
                }}
                className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Decrease reps"
              >
                <Minus size={18} />
              </button>
              <span className="font-mono-metric font-bold text-base text-[#0F172A] min-w-[64px] text-center">
                {reps}
              </span>
              <button
                type="button"
                onClick={() => {
                  const idx = repPresets.indexOf(reps);
                  if (idx !== -1 && idx < repPresets.length - 1) setReps(repPresets[idx + 1]);
                  else if (idx === -1) setReps(repPresets[repPresets.length - 1]);
                }}
                className="w-10 h-10 rounded-xl bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Increase reps"
              >
                <Plus size={18} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Quick Rep Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {repPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReps(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono-metric border transition-all cursor-pointer ${
                  reps === preset
                    ? 'bg-[#008B8E] text-white border-[#008B8E] shadow-sm'
                    : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Dedicated Target Weight Stepper & Plate Chips */}
        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D96B27]/10 text-[#D96B27] flex items-center justify-center">
                <Dumbbell size={16} />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Target Weight</span>
                <span className="text-[11px] text-[#475569] font-medium">Load per working set</span>
              </div>
            </div>

            {/* Stepper with +/- 2.5kg */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjustWeight(-2.5)}
                className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Decrease weight by 2.5kg"
              >
                <Minus size={18} />
              </button>

              <div className="flex items-baseline justify-center min-w-[70px]">
                <span className="font-mono-metric font-bold text-xl text-[#0F172A]">
                  {weightKg}
                </span>
                <span className="text-xs text-[#475569] font-bold ml-1">kg</span>
              </div>

              <button
                type="button"
                onClick={() => handleAdjustWeight(2.5)}
                className="w-10 h-10 rounded-xl bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Increase weight by 2.5kg"
              >
                <Plus size={18} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Quick Increment/Decrement Chips */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[-5, -2.5, 2.5, 5, 10].map((delta) => (
              <button
                key={delta}
                type="button"
                onClick={() => handleAdjustWeight(delta)}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold font-mono-metric border transition-all cursor-pointer text-center ${
                  delta > 0
                    ? 'bg-[#008B8E]/10 text-[#008B8E] border-[#008B8E]/30 hover:bg-[#008B8E] hover:text-white'
                    : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A] hover:bg-white'
                }`}
              >
                {delta > 0 ? `+${delta}` : delta} kg
              </button>
            ))}
          </div>
        </div>

        {/* Dedicated Rest Target Interval & Presets */}
        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#008B8E]/10 text-[#008B8E] flex items-center justify-center">
                <Clock size={16} />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Rest Interval</span>
                <span className="text-[11px] text-[#475569] font-medium">Recovery timer between sets</span>
              </div>
            </div>

            {/* Stepper with +/- 15s */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdjustRest(-15)}
                className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Decrease rest by 15s"
              >
                <Minus size={18} />
              </button>

              <span className="font-mono-metric font-bold text-base text-[#008B8E] min-w-[55px] text-center bg-[#008B8E]/10 border border-[#008B8E]/30 py-1 px-2 rounded-lg">
                {formatRest(restSeconds)}
              </span>

              <button
                type="button"
                onClick={() => handleAdjustRest(15)}
                className="w-10 h-10 rounded-xl bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-95 transition-all cursor-pointer shadow-sm"
                aria-label="Increase rest by 15s"
              >
                <Plus size={18} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Quick Rest Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            {restPresets.map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setRestSeconds(sec)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold font-mono-metric border transition-all cursor-pointer text-center ${
                  restSeconds === sec
                    ? 'bg-[#008B8E] text-white border-[#008B8E] shadow-sm'
                    : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:text-[#0F172A]'
                }`}
              >
                {sec < 60 ? `${sec}s` : `${sec / 60}m`}
              </button>
            ))}
          </div>
        </div>

        {/* Training Notes */}
        <div className="pt-1">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional training focus notes..."
            className="w-full bg-white/85 border border-[#CBD5E1] rounded-2xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] text-xs focus:outline-none focus:border-[#008B8E] transition-colors shadow-sm"
          />
        </div>
      </div>

      {/* 5. Instructions & Technique Guidance */}
      {exercise.instructions && exercise.instructions.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#475569]">
            <BookOpen size={14} className="text-[#008B8E]" />
            <span>Form & Execution Guide</span>
          </div>
          <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 space-y-2.5 shadow-sm backdrop-blur-md">
            {exercise.instructions.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[#334155] leading-relaxed">
                <span className="w-5 h-5 rounded-full bg-[#008B8E]/10 text-[#008B8E] text-[10px] font-bold font-mono-metric flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Pro Form Tips */}
      {exercise.formTips && exercise.formTips.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#008B8E]">
            <Lightbulb size={14} />
            <span>Pro Form Tips</span>
          </div>
          <div className="bg-[#008B8E]/5 border border-[#008B8E]/25 rounded-2xl p-3.5 space-y-1.5">
            {exercise.formTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#0F172A] leading-relaxed">
                <span className="text-[#008B8E] font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Common Mistakes */}
      {exercise.commonMistakes && exercise.commonMistakes.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#EF4444]">
            <AlertCircle size={14} />
            <span>Common Mistakes to Avoid</span>
          </div>
          <div className="bg-[#EF4444]/5 border border-[#EF4444]/25 rounded-2xl p-3.5 space-y-1.5">
            {exercise.commonMistakes.map((err, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#991B1B] leading-relaxed">
                <span className="text-[#EF4444] font-bold">✕</span>
                <span>{err}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PRIMARY CTA: SAVE / ADD EXERCISE TO ROUTINE */}
      <div className="pt-3">
        <button
          type="button"
          onClick={handleAddAction}
          className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-lg transition-all cursor-pointer tracking-wider text-sm uppercase"
        >
          {routineId ? (
            <>
              <Check size={18} className="stroke-[3]" />
              <span>SAVE EXERCISE TO ROUTINE</span>
            </>
          ) : (
            <>
              <Plus size={18} className="stroke-[3]" />
              <span>ADD TO ROUTINE</span>
            </>
          )}
        </button>
      </div>

      {/* Routine Picker Sheet */}
      {showRoutinePicker && (
        <AddToRoutineModal
          isOpen={showRoutinePicker}
          onClose={() => setShowRoutinePicker(false)}
          exercise={exercise}
        />
      )}
    </div>
  );
};
