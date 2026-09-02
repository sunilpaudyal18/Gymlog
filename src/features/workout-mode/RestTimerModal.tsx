import React from 'react';
import { FastForward, Plus, Minus, Pause, Play, ArrowRight } from 'lucide-react';
import { useWorkoutStore } from '../../stores/useWorkoutStore';

export const RestTimerModal: React.FC = () => {
  const {
    restTimeRemaining,
    restTargetSeconds,
    timerState,
    addSecondsRest,
    subtractSecondsRest,
    pauseRestTimer,
    resumeRestTimer,
    skipRestTimer,
    activeSession,
    currentExerciseIndex,
    activeSetIndex,
  } = useWorkoutStore();

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Ring calculation
  const radius = 115;
  const circumference = 2 * Math.PI * radius;
  const progress =
    restTargetSeconds > 0
      ? Math.max(0, Math.min(1, restTimeRemaining / restTargetSeconds))
      : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const currentExercise = activeSession?.exercises[currentExerciseIndex];
  const nextExercise =
    activeSession && currentExerciseIndex < activeSession.exercises.length - 1
      ? activeSession.exercises[currentExerciseIndex + 1]
      : currentExercise;

  const isNextSetSameExercise =
    currentExercise && activeSetIndex < currentExercise.sets.length;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F6F9] flex flex-col justify-between p-6 max-w-md mx-auto animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#008B8E] animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            REST IN PROGRESS
          </span>
        </div>
        <button
          type="button"
          onClick={skipRestTimer}
          className="text-xs font-bold text-[#008B8E] uppercase tracking-wider hover:underline cursor-pointer"
        >
          TAP TO SKIP
        </button>
      </div>

      {/* Center Circular Timer Ring with High-Fidelity SVG */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 260 260">
            {/* Background Track */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              className="stroke-[#E2E8F0]"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Animated Glowing Progress Ring */}
            <circle
              cx="130"
              cy="130"
              r={radius}
              className={`stroke-[#008B8E] transition-all duration-1000 ease-linear ${
                timerState === 'paused' ? 'opacity-50' : ''
              }`}
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(0, 139, 142, 0.4))',
              }}
            />
          </svg>

          {/* Centered Timer Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-[#008B8E] tracking-wider uppercase mb-1">
              {timerState === 'paused' ? 'TIMER PAUSED' : 'REST REMAINING'}
            </span>
            <span className="text-5xl font-bold font-mono-metric text-[#0F172A] tracking-tight">
              {formatTimer(restTimeRemaining)}
            </span>
            <span className="text-xs text-[#475569] font-medium mt-2">
              Target: {formatTimer(restTargetSeconds)}
            </span>
          </div>
        </div>

        {/* Adjust Timer Controls (+15s, Pause/Resume, -15s) */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => subtractSecondsRest(15)}
            className="bg-white hover:bg-[#F1F5F9] active:scale-95 text-[#475569] hover:text-[#0F172A] px-3.5 py-2 rounded-xl text-xs font-bold font-mono-metric border border-[#CBD5E1] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            aria-label="Subtract 15 seconds"
          >
            <Minus size={13} />
            <span>15s</span>
          </button>

          <button
            type="button"
            onClick={timerState === 'paused' ? resumeRestTimer : pauseRestTimer}
            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              timerState === 'paused'
                ? 'bg-[#008B8E] text-white'
                : 'bg-white text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1]'
            }`}
          >
            {timerState === 'paused' ? (
              <>
                <Play size={13} className="fill-current" />
                <span>Resume</span>
              </>
            ) : (
              <>
                <Pause size={13} />
                <span>Pause</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => addSecondsRest(15)}
            className="bg-white hover:bg-[#F1F5F9] active:scale-95 text-[#008B8E] px-3.5 py-2 rounded-xl text-xs font-bold font-mono-metric border border-[#CBD5E1] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            aria-label="Add 15 seconds"
          >
            <Plus size={13} className="stroke-[3]" />
            <span>15s</span>
          </button>
        </div>
      </div>

      {/* Action Buttons & UP NEXT */}
      <div className="space-y-4 pb-6">
        {/* +30 SEC and SKIP REST */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => addSecondsRest(30)}
            className="bg-white text-[#0F172A] font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-1.5 hover:bg-[#F1F5F9] active:scale-95 border border-[#CBD5E1] transition-all cursor-pointer text-xs uppercase tracking-wider shadow-sm"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>+30 SEC</span>
          </button>

          <button
            type="button"
            onClick={skipRestTimer}
            className="bg-[#008B8E] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] active:scale-95 shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
          >
            <FastForward size={15} className="fill-current" />
            <span>SKIP REST</span>
          </button>
        </div>

        {/* UP NEXT Preview Card */}
        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 flex items-center gap-4 shadow-sm backdrop-blur-md">
          <div className="w-10 h-10 rounded-xl bg-[#008B8E]/10 border border-[#008B8E]/20 flex items-center justify-center text-[#008B8E] shrink-0">
            <ArrowRight size={20} className="stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] block">
              UP NEXT
            </span>
            <h4 className="text-base font-bold text-[#0F172A] tracking-tight truncate">
              {isNextSetSameExercise
                ? `${currentExercise?.exerciseName} • Set ${activeSetIndex + 1}`
                : nextExercise?.exerciseName || 'Next Exercise'}
            </h4>
            <p className="text-xs text-[#475569] font-medium mt-0.5 truncate">
              {isNextSetSameExercise
                ? `${currentExercise?.sets[activeSetIndex]?.weightKg || 32.5} kg × ${
                    currentExercise?.sets[activeSetIndex]?.reps || 10
                  } reps`
                : `${nextExercise?.sets.length || 3} sets • ${
                    nextExercise?.sets[0]?.reps || 10
                  } reps`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
