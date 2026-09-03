import React, { useEffect, useState } from 'react';
import { Dumbbell, Trophy, TrendingUp, Award } from 'lucide-react';

interface MetricKpiStripProps {
  totalVolumeKg: number;
  totalSets: number;
  weeklyWorkouts: number;
  weeklyTarget?: number;
  totalPrs: number;
  totalSessions: number;
}

// Lightweight 60fps number ticker hook with ease-out cubic
function useCountUp(target: number, durationMs = 800): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // Ease out cubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(easeOut * target));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, durationMs]);

  return count;
}

export const MetricKpiStrip: React.FC<MetricKpiStripProps> = ({
  totalVolumeKg,
  totalSets,
  weeklyWorkouts,
  weeklyTarget = 5,
  totalPrs,
  totalSessions,
}) => {
  const animatedVolume = useCountUp(totalVolumeKg);
  const animatedSets = useCountUp(totalSets);
  const animatedPrs = useCountUp(totalPrs);

  // Radial ring calculation for weekly target
  const weeklyPct = Math.min(Math.round((weeklyWorkouts / weeklyTarget) * 100), 100);
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (weeklyPct / 100) * circumference;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
      {/* 1. Total Volume Card */}
      <div
        className="group relative rounded-2xl p-4 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md hover:-translate-y-[2px] transition-all duration-200 overflow-hidden"
        style={{
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#475569] text-xs font-bold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-[#008B8E]/10 flex items-center justify-center text-[#008B8E]">
              <Dumbbell size={13} />
            </div>
            <span>Volume</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-2 py-0.5 rounded-full border border-[#008B8E]/20">
            +14% vs avg
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono-metric text-[#0F172A] tracking-tight block">
              {animatedVolume.toLocaleString()}
              <span className="text-xs font-semibold text-[#64748B] ml-1 font-sans">kg</span>
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block font-medium">
              Across {totalSessions} workouts
            </span>
          </div>

          {/* Micro Sparkline SVG */}
          <div className="w-16 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 64 32" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="volSpark" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#008B8E" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#008B8E" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M 2 26 Q 14 24, 24 16 T 44 14 T 62 4 L 62 30 L 2 30 Z"
                fill="url(#volSpark)"
              />
              <path
                d="M 2 26 Q 14 24, 24 16 T 44 14 T 62 4"
                fill="none"
                stroke="#008B8E"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="62" cy="4" r="2.5" className="fill-[#008B8E] stroke-white stroke-1" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. Total Sets Card */}
      <div
        className="group relative rounded-2xl p-4 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md hover:-translate-y-[2px] transition-all duration-200 overflow-hidden"
        style={{
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#475569] text-xs font-bold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-[#D96B27]/10 flex items-center justify-center text-[#D96B27]">
              <Trophy size={13} />
            </div>
            <span>Total Sets</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-2 py-0.5 rounded-full border border-[#D96B27]/20">
            Workload
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono-metric text-[#0F172A] tracking-tight block">
              {animatedSets}
              <span className="text-xs font-semibold text-[#64748B] ml-1 font-sans">sets</span>
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block font-medium">
              Completed lifts
            </span>
          </div>

          {/* Mini Bar Histogram Sparkline */}
          <div className="flex items-end gap-1 h-8 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-1.5 h-3.5 rounded-sm bg-[#D96B27]/30" />
            <div className="w-1.5 h-5 rounded-sm bg-[#D96B27]/50" />
            <div className="w-1.5 h-4 rounded-sm bg-[#D96B27]/40" />
            <div className="w-1.5 h-6.5 rounded-sm bg-[#D96B27]/70" />
            <div className="w-1.5 h-7 rounded-sm bg-[#D96B27]" />
          </div>
        </div>
      </div>

      {/* 3. Weekly Frequency Card (with Radial Completion Ring) */}
      <div
        className="group relative rounded-2xl p-4 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md hover:-translate-y-[2px] transition-all duration-200 overflow-hidden"
        style={{
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#475569] text-xs font-bold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-[#008B8E]/10 flex items-center justify-center text-[#008B8E]">
              <TrendingUp size={13} />
            </div>
            <span>This Week</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-2 py-0.5 rounded-full border border-[#008B8E]/20">
            {weeklyPct}% Target
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono-metric text-[#0F172A] tracking-tight block">
              {weeklyWorkouts}
              <span className="text-xs font-semibold text-[#64748B] ml-1 font-sans">/ {weeklyTarget} wk</span>
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block font-medium">
              Weekly frequency
            </span>
          </div>

          {/* Radial SVG Ring */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 40 40">
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-[#E2E8F0]"
                strokeWidth="3.5"
                fill="transparent"
              />
              <circle
                cx="20"
                cy="20"
                r={radius}
                className="stroke-[#008B8E] transition-all duration-700 ease-out"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-[#008B8E] font-mono-metric">
              {weeklyWorkouts}
            </span>
          </div>
        </div>
      </div>

      {/* 4. PRs Set Card */}
      <div
        className="group relative rounded-2xl p-4 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md hover:-translate-y-[2px] transition-all duration-200 overflow-hidden"
        style={{
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#475569] text-xs font-bold uppercase tracking-wider">
            <div className="w-6 h-6 rounded-lg bg-[#D96B27]/10 flex items-center justify-center text-[#D96B27]">
              <Award size={13} />
            </div>
            <span>Records</span>
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-2 py-0.5 rounded-full border border-[#D96B27]/20">
            Active
          </span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between">
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono-metric text-[#0F172A] tracking-tight block">
              {animatedPrs}
              <span className="text-xs font-semibold text-[#64748B] ml-1 font-sans">PRs</span>
            </span>
            <span className="text-[11px] text-[#64748B] mt-0.5 block font-medium">
              Verified milestones
            </span>
          </div>

          {/* Electric Volt Energy Accent Pulse */}
          <div className="w-7 h-7 rounded-xl bg-[#B4FF39]/20 border border-[#B4FF39] flex items-center justify-center text-[#0F172A] shadow-xs">
            <Award size={14} className="text-[#008B8E] fill-[#B4FF39]" />
          </div>
        </div>
      </div>
    </div>
  );
};
