import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Minus, Plus, Dumbbell, Clock } from 'lucide-react';
import { useExerciseStore } from '../../stores/useExerciseStore';
import { useRoutineStore } from '../../stores/useRoutineStore';

export const AddExerciseScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const routineId = searchParams.get('routineId');

  const { getExerciseById, exercises } = useExerciseStore();
  const { routines, addExerciseToRoutine } = useRoutineStore();

  const [selectedExId] = useState<string>(id || 'incline-dumbbell-press');

  const exercise = getExerciseById(selectedExId) || exercises[1] || exercises[0];

  const [sets, setSets] = useState(exercise.defaultSets || 3);
  const [reps, setReps] = useState(exercise.defaultReps || '8 - 12');
  const [weightKg, setWeightKg] = useState(exercise.defaultWeightKg || 32.5);
  const [restSeconds, setRestSeconds] = useState(exercise.defaultRestSeconds || 90);
  const [notes, setNotes] = useState('');

  const formatRest = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAdjustWeight = (delta: number) => {
    setWeightKg((prev) => Math.max(0, Number((prev + delta).toFixed(1))));
  };

  const handleAdjustRest = (delta: number) => {
    setRestSeconds((prev) => Math.max(15, Math.min(600, prev + delta)));
  };

  const handleAddExercise = () => {
    const targetRoutineId = routineId || routines[0]?.id;
    if (targetRoutineId) {
      const newRoutineExercise = {
        id: 're-' + Date.now(),
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        muscleGroup: exercise.primaryMuscle,
        equipment: exercise.equipment,
        targetSets: sets,
        targetReps: reps,
        targetWeightKg: weightKg,
        restSeconds: restSeconds,
        notes: notes,
        order: 99,
      };

      addExerciseToRoutine(targetRoutineId, newRoutineExercise);
      navigate(`/routine-preview/${targetRoutineId}`);
    } else {
      navigate('/workouts');
    }
  };

  const repPresets = ['6 - 8', '8 - 10', '8 - 12', '10 - 15', '12 - 20'];
  const restPresets = [45, 60, 90, 120, 180];

  return (
    <div className="flex flex-col px-4 pt-4 pb-24 space-y-5 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>

        <h1 className="text-base font-bold text-[#0F172A] tracking-wider uppercase text-center truncate max-w-[220px]">
          {exercise.name}
        </h1>

        <div className="w-8" />
      </div>

      {/* Target Sets Stepper */}
      <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 flex items-center justify-between shadow-sm backdrop-blur-md">
        <div>
          <span className="text-sm font-bold text-[#0F172A] block">Target Sets</span>
          <span className="text-[11px] text-[#475569] font-medium">Working volume sets</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSets(Math.max(1, sets - 1))}
            className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
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
          >
            <Plus size={18} className="stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Target Reps Stepper */}
      <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
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
              }}
              className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
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
              }}
              className="w-10 h-10 rounded-xl bg-[#008B8E] text-white flex items-center justify-center hover:bg-[#00A3A6] active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Plus size={18} className="stroke-[3]" />
            </button>
          </div>
        </div>

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

      {/* Target Weight Stepper & Quick Plate Chips */}
      <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjustWeight(-2.5)}
              className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Decrease weight"
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
              aria-label="Increase weight"
            >
              <Plus size={18} className="stroke-[3]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {[-5, -2.5, 2.5, 5, 10].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => handleAdjustWeight(delta)}
              className={`py-1.5 px-1 rounded-lg text-xs font-bold font-mono-metric border transition-all cursor-pointer text-center ${
                delta > 0
                  ? 'bg-[#008B8E]/10 text-[#008B8E] border-[#008B8E]/30 hover:bg-[#008B8E] hover:text-white'
                  : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A]'
              }`}
            >
              {delta > 0 ? `+${delta}` : delta} kg
            </button>
          ))}
        </div>
      </div>

      {/* Rest Target Stepper & Presets */}
      <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm backdrop-blur-md">
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjustRest(-15)}
              className="w-10 h-10 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 transition-all cursor-pointer shadow-sm"
              aria-label="Decrease rest"
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
              aria-label="Increase rest"
            >
              <Plus size={18} className="stroke-[3]" />
            </button>
          </div>
        </div>

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

      {/* Notes Input */}
      <div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional training notes..."
          className="w-full bg-white/85 border border-[#CBD5E1] rounded-2xl px-4 py-3.5 text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none focus:border-[#008B8E] transition-colors shadow-sm"
        />
      </div>

      {/* Save Button */}
      <div>
        <button
          type="button"
          onClick={handleAddExercise}
          className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] shadow-md uppercase tracking-wider text-base cursor-pointer"
        >
          <span>ADD EXERCISE TO ROUTINE</span>
        </button>
      </div>
    </div>
  );
};
