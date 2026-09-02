import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, Plus, Timer, Flame, Dumbbell } from 'lucide-react';
import { Routine } from '../../../types';
import { useWorkoutStore } from '../../../stores/useWorkoutStore';

export interface TodaySessionCardProps {
  routine?: Routine | null;
  isCompletedToday?: boolean;
}

export const TodaySessionCard: React.FC<TodaySessionCardProps> = ({
  routine,
  isCompletedToday = false,
}) => {
  const navigate = useNavigate();
  const { startWorkoutFromRoutine } = useWorkoutStore();

  const handleStartWorkout = () => {
    if (routine) {
      startWorkoutFromRoutine(routine);
      navigate('/workout-mode');
    } else {
      navigate('/workouts');
    }
  };

  // 1. Empty State (No routine planned)
  if (!routine) {
    return (
      <div
        className="relative rounded-3xl p-5 shadow-sm space-y-4 overflow-hidden border border-[#CBD5E1]/60"
        style={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Top specular highlight stroke */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        <div className="inline-block bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1] px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
          NO WORKOUT SCHEDULED
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Rest Day or Free Training
          </h2>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            Select a routine from your library or create a custom workout.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/workouts')}
          className="w-full rounded-full bg-white/80 hover:bg-white text-[#008B8E] border border-[#008B8E]/30 font-bold py-3.5 px-6 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm uppercase tracking-wider shadow-sm hover:shadow"
        >
          <Plus size={18} className="stroke-[2.5]" />
          <span>CHOOSE ROUTINE</span>
        </button>
      </div>
    );
  }

  const totalExercises = routine.exercises.length || 6;
  const totalSets =
    routine.exercises.reduce((acc, ex) => acc + (ex.targetSets || 3), 0) || 19;
  const durationMin = routine.estimatedDurationMin || 55;
  const estimatedCalories = Math.round(durationMin * 5.8);

  // 2. Completed State
  if (isCompletedToday) {
    return (
      <div
        className="relative rounded-3xl p-5 shadow-sm space-y-4 overflow-hidden border border-[#CBD5E1]/60"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.88) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Top specular highlight stroke */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* Subtle diagonal glare / light reflection */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.05)_35%,transparent_60%)] pointer-events-none" />

        <div className="inline-block bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
          COMPLETED TODAY
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">
            {routine.name}
          </h2>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            {totalExercises} Exercises • {totalSets} Sets • ~{durationMin} min
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/workout-complete')}
          className="w-full relative rounded-full bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/40 font-bold py-3.5 px-6 flex items-center justify-center gap-2 hover:bg-[#008B8E] hover:text-white transition-all cursor-pointer text-sm uppercase tracking-wider shadow-sm"
        >
          <CheckCircle2 size={18} className="stroke-[2.5]" />
          <span>VIEW SUMMARY</span>
        </button>
      </div>
    );
  }

  // 3. Normal Active State (Aetheric Quartz Today's Session Hero Card)
  return (
    <div
      className="relative rounded-3xl p-5 shadow-sm space-y-4 overflow-hidden border border-[#CBD5E1]/60 select-none"
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.88) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow:
          '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 0 20px -2px rgba(0, 139, 142, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* 1. Subtle diagonal glare / light reflection streak across upper-left */}
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.08)_35%,transparent_60%)] pointer-events-none" />

      {/* Top linear specular highlight stroke */}
      <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

      {/* 2. Header Tag: "TODAY'S SESSION" pill badge using #008B8E outline, small uppercase bold text */}
      <div className="inline-flex items-center gap-1.5 bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[#008B8E] animate-pulse" />
        <span>TODAY'S SESSION</span>
      </div>

      {/* Main Workout Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-snug">
          {routine.name}
        </h2>
        <p className="text-xs text-[#475569] mt-1 font-medium">
          {totalExercises} Exercises • {totalSets} Sets • ~{durationMin} min
        </p>
      </div>

      {/* Key Metrics Inline Glass Row with Dual-Accent Integration */}
      <div className="grid grid-cols-3 gap-2 pt-0.5">
        {/* Metric 1: Duration (Teal Accent) */}
        <div className="bg-white/75 border border-[#CBD5E1]/50 rounded-2xl p-2.5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Timer size={11} className="text-[#008B8E]" />
            <span>Duration</span>
          </div>
          <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
            ~{durationMin} min
          </span>
        </div>

        {/* Metric 2: Est. Burn - Secondary Warm Energy Accent (Burnt Amber #D96B27) */}
        <div
          className="bg-white/75 border border-[#D96B27]/30 rounded-2xl p-2.5 text-center shadow-sm"
          style={{
            boxShadow: '0 2px 8px rgba(217, 107, 39, 0.08)',
          }}
        >
          <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Flame size={11} className="text-[#D96B27]" />
            <span>Est. Burn</span>
          </div>
          <span className="text-xs font-mono-metric font-bold text-[#D96B27] mt-0.5 block">
            {estimatedCalories} kcal
          </span>
        </div>

        {/* Metric 3: Total Sets (Teal Accent) */}
        <div className="bg-white/75 border border-[#CBD5E1]/50 rounded-2xl p-2.5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Dumbbell size={11} className="text-[#008B8E]" />
            <span>Total Sets</span>
          </div>
          <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5 block">
            {totalSets} Sets
          </span>
        </div>
      </div>

      {/* 3. Primary Call-To-Action (Start Workout Button with Glass & Neon Under-Light) */}
      <div className="pt-2 pb-1 relative flex flex-col items-center">
        <button
          type="button"
          onClick={handleStartWorkout}
          className="w-full relative rounded-full py-3.5 px-6 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-sm font-bold tracking-wider uppercase text-white shadow-md hover:bg-[#00A3A6] active:scale-[0.99] group bg-[#008B8E]"
        >
          {/* Subtle button specular light */}
          <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          <Play size={16} className="fill-white stroke-white group-hover:scale-110 transition-transform" />
          <span>START WORKOUT</span>
        </button>

        {/* Electric Cyan Under-Light Strip directly beneath the button edge */}
        <div
          className="w-28 h-[3px] rounded-full bg-[#008B8E] -mt-[1px] relative z-10"
          style={{
            boxShadow:
              '0 0 8px #008B8E, 0 0 16px rgba(0, 139, 142, 0.6), 0 3px 6px rgba(0, 139, 142, 0.4)',
          }}
        />
        {/* Downward focused diffused glow onto card base */}
        <div className="w-36 h-3 bg-[#008B8E]/25 blur-[6px] rounded-full -mt-0.5 pointer-events-none" />
      </div>
    </div>
  );
};
