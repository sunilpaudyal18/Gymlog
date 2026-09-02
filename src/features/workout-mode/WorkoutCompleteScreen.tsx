import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Timer, ListChecks, RotateCcw, Dumbbell, Trophy, CloudOff } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHistoryStore } from '../../stores/useHistoryStore';

export const WorkoutCompleteScreen: React.FC = () => {
  const navigate = useNavigate();
  const { completedSessions } = useHistoryStore();

  const lastSession = completedSessions[0];

  useEffect(() => {
    // Fire celebratory confetti on mount (respects reduced motion)
    try {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.35 },
          colors: ['#008B8E', '#D96B27', '#0F172A', '#38BDF8'],
        });
      }
    } catch {
      // Confetti fallback
    }
  }, []);

  const durationMin = lastSession
    ? Math.max(1, Math.round(lastSession.durationSeconds / 60))
    : 55;
  const exercisesCount = lastSession ? lastSession.exercises.length : 6;
  const totalSets = lastSession ? lastSession.totalSetsCompleted : 19;
  const volumeLifted = lastSession ? lastSession.totalVolumeKg : 8450;
  const newPRs = lastSession ? lastSession.newPRsCount : 2;

  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  return (
    <div className="flex flex-col px-4 pt-6 pb-12 space-y-6 text-center animate-fade-in max-w-md mx-auto select-none">
      {/* Big Teal Success Check Circle */}
      <div className="flex justify-center pt-2">
        <div className="w-24 h-24 rounded-full bg-[#008B8E]/12 border-2 border-[#008B8E] text-[#008B8E] flex items-center justify-center shadow-md animate-pulse">
          <Check size={48} className="stroke-[3]" />
        </div>
      </div>

      {/* Celebratory Headers */}
      <div>
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight flex items-center justify-center gap-2">
          <span>WORKOUT COMPLETE</span>
          <span>🔥</span>
        </h1>
        <h2 className="text-sm font-bold text-[#008B8E] tracking-wider uppercase mt-1">
          {lastSession?.routineName || 'CHEST + TRICEPS FOCUS'}
        </h2>
        <p className="text-xs text-[#475569] mt-2 font-medium">
          Incredible effort! You are staying consistent.
        </p>
      </div>

      {/* Offline sync note if offline */}
      {isOffline && (
        <div className="bg-white/80 border border-[#CBD5E1] rounded-xl px-3 py-2 flex items-center justify-center gap-2 text-xs text-[#475569] shadow-sm">
          <CloudOff size={14} className="text-[#D96B27]" />
          <span>Saved locally. Will sync when back online.</span>
        </div>
      )}

      {/* Session Metrics Card */}
      <div className="text-left space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1">
          Session Metrics
        </span>

        <div className="bg-white/85 border border-[#CBD5E1] rounded-2xl p-4 divide-y divide-[#E2E8F0] shadow-sm backdrop-blur-md">
          {/* Duration */}
          <div className="flex items-center justify-between py-3 first:pt-1">
            <div className="flex items-center gap-3 text-[#475569]">
              <Timer size={18} className="text-[#008B8E]" />
              <span className="text-sm font-semibold text-[#0F172A]">Duration</span>
            </div>
            <span className="font-mono-metric font-bold text-base text-[#0F172A]">
              {durationMin} min
            </span>
          </div>

          {/* Exercises */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 text-[#475569]">
              <ListChecks size={18} className="text-[#008B8E]" />
              <span className="text-sm font-semibold text-[#0F172A]">Exercises</span>
            </div>
            <span className="font-mono-metric font-bold text-base text-[#0F172A]">
              {exercisesCount} Completed
            </span>
          </div>

          {/* Total Sets */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 text-[#475569]">
              <RotateCcw size={18} className="text-[#00A3A6]" />
              <span className="text-sm font-semibold text-[#0F172A]">Total Sets</span>
            </div>
            <span className="font-mono-metric font-bold text-base text-[#0F172A]">
              {totalSets} logged
            </span>
          </div>

          {/* Volume Lifted */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3 text-[#475569]">
              <Dumbbell size={18} className="text-[#008B8E]" />
              <span className="text-sm font-semibold text-[#0F172A]">Volume Lifted</span>
            </div>
            <span className="font-mono-metric font-bold text-base text-[#0F172A]">
              {volumeLifted.toLocaleString()} kg
            </span>
          </div>

          {/* New PRs - Highlighted with Burnt Energy Amber */}
          <div className="flex items-center justify-between py-3 last:pb-1">
            <div className="flex items-center gap-3 text-[#475569]">
              <Trophy size={18} className="text-[#D96B27]" />
              <span className="text-sm font-semibold text-[#0F172A]">New PRs</span>
            </div>
            <span className="font-mono-metric font-bold text-base text-[#D96B27]">
              {newPRs} Achieved
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full bg-[#008B8E] text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md transition-all cursor-pointer tracking-wider text-base uppercase"
        >
          DONE
        </button>

        <button
          type="button"
          onClick={() => navigate('/history')}
          className="w-full bg-white text-[#0F172A] font-bold py-3.5 px-6 rounded-xl flex items-center justify-center hover:bg-[#F1F5F9] active:scale-95 border border-[#CBD5E1] transition-all cursor-pointer text-sm uppercase tracking-wider shadow-sm"
        >
          VIEW DETAILED SUMMARY
        </button>
      </div>
    </div>
  );
};
