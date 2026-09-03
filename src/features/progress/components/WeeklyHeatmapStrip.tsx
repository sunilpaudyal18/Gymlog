import React, { useState } from 'react';
import { Check, Flame, Moon, Dumbbell, Timer } from 'lucide-react';
import { WorkoutSession } from '../../../types';
import { getCurrentWeekDays, isSameCalendarDay, REST_DAY_INFO } from '../../../utils/scheduler';

interface WeeklyHeatmapStripProps {
  sessions: WorkoutSession[];
}

export const WeeklyHeatmapStrip: React.FC<WeeklyHeatmapStripProps> = ({ sessions }) => {
  const [activeHoverIndex, setActiveHoverIndex] = useState<number | null>(null);

  const weekDays = getCurrentWeekDays();

  // Find workout or routine info for each day
  const dayDetails = weekDays.map((node) => {
    const session = sessions.find((s) =>
      s.status === 'completed' && isSameCalendarDay(s.completedAt || s.startedAt, node.date)
    );

    const isRest = node.dayIndex === 0 || node.dayIndex === 6;
    const restInfo = isRest ? REST_DAY_INFO[node.dayIndex] : null;

    return {
      ...node,
      hasWorkout: Boolean(session),
      session,
      restInfo,
    };
  });

  const totalThisWeek = dayDetails.filter((d) => d.hasWorkout).length;

  return (
    <div
      className="relative rounded-2xl p-4 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md space-y-3 select-none"
      style={{
        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            WEEKLY CONSISTENCY HEATMAP
          </span>
          <span className="text-[10px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-2 py-0.5 rounded-full border border-[#008B8E]/20">
            {totalThisWeek} Completed
          </span>
        </div>
        <span className="text-xs text-[#64748B] font-medium hidden sm:inline-block">
          Hover for telemetry
        </span>
      </div>

      {/* 7-Day Activity Node Bar */}
      <div className="grid grid-cols-7 gap-2 text-center relative">
        {dayDetails.map((day, idx) => {
          const isCompleted = day.hasWorkout;
          const isToday = day.isToday;
          const isHovered = activeHoverIndex === idx;

          return (
            <div
              key={idx}
              className="relative flex flex-col items-center gap-1.5 cursor-pointer"
              onMouseEnter={() => setActiveHoverIndex(idx)}
              onMouseLeave={() => setActiveHoverIndex(null)}
              onClick={() => setActiveHoverIndex(isHovered ? null : idx)}
            >
              {/* Day Label (M T W T F S S) */}
              <span
                className={`text-[11px] font-bold transition-colors ${
                  isToday
                    ? 'text-[#008B8E] font-black'
                    : isCompleted
                    ? 'text-[#0F172A]'
                    : 'text-[#64748B]'
                }`}
              >
                {day.dayLabel}
              </span>

              {/* Day Node Interactive Box */}
              <div
                className={`relative w-10 h-10 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'shadow-sm text-white scale-[1.02]'
                    : isToday
                    ? 'border-2 border-[#008B8E] bg-white text-[#008B8E]'
                    : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#CBD5E1]/60 hover:border-[#94A3B8]'
                }`}
                style={{
                  background: isCompleted
                    ? 'linear-gradient(135deg, #008B8E 0%, #006D70 100%)'
                    : undefined,
                  boxShadow: isCompleted
                    ? '0 4px 12px -2px rgba(0, 139, 142, 0.35)'
                    : undefined,
                }}
              >
                {/* Active Today Pulse Ring in Electric Volt */}
                {isToday && (
                  <span
                    className="absolute inset-0 rounded-2xl border-2 border-[#B4FF39] animate-ping pointer-events-none"
                    style={{ opacity: 0.55 }}
                  />
                )}

                {isCompleted ? (
                  <Check size={16} className="stroke-[3] text-[#B4FF39]" />
                ) : isToday ? (
                  <span className="w-2 h-2 rounded-full bg-[#008B8E] shadow-[0_0_8px_#008B8E]" />
                ) : day.restInfo ? (
                  <Moon size={13} className="text-[#94A3B8]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                )}
              </div>

              {/* Today Electric Neon Under-Glow Strip */}
              {isToday && (
                <div
                  className="w-5 h-[2px] rounded-full bg-[#008B8E] -mt-0.5 pointer-events-none"
                  style={{
                    boxShadow: '0 0 6px #008B8E, 0 0 10px rgba(0, 139, 142, 0.8)',
                  }}
                />
              )}

              {/* Interactive Micro-Popover */}
              {isHovered && (
                <div
                  className="absolute z-50 bottom-full mb-3 w-48 sm:w-56 p-3 rounded-2xl bg-[#0F172A] text-white shadow-xl border border-white/10 text-left pointer-events-none animate-fade-in"
                  style={{
                    left: idx === 0 ? '0' : idx === 6 ? 'auto' : '50%',
                    right: idx === 6 ? '0' : 'auto',
                    transform: idx === 0 || idx === 6 ? 'none' : 'translateX(-50%)',
                  }}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                    <span className="text-[10px] font-bold text-[#B4FF39] uppercase tracking-wider">
                      {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                        isCompleted
                          ? 'bg-[#008B8E]/30 text-[#B4FF39]'
                          : isToday
                          ? 'bg-white/15 text-white'
                          : 'bg-white/10 text-[#94A3B8]'
                      }`}
                    >
                      {isCompleted ? 'COMPLETED' : isToday ? 'TODAY' : day.restInfo ? 'REST' : 'PLANNED'}
                    </span>
                  </div>

                  {day.session ? (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-white block truncate">
                        {day.session.routineName || 'Completed Workout'}
                      </span>
                      <div className="grid grid-cols-3 gap-1 text-[10px] pt-0.5">
                        <div>
                          <span className="text-[#94A3B8] block text-[9px]">Volume</span>
                          <span className="font-mono-metric font-bold text-white">
                            {(day.session.totalVolumeKg || 0).toLocaleString()} kg
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A3B8] block text-[9px]">Sets</span>
                          <span className="font-mono-metric font-bold text-[#B4FF39]">
                            {day.session.totalSetsCompleted || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#94A3B8] block text-[9px]">Time</span>
                          <span className="font-mono-metric font-bold text-white">
                            {Math.round((day.session.durationSeconds || 0) / 60)} min
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : day.restInfo ? (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#CBD5E1] block">
                        {day.restInfo.title}
                      </span>
                      <p className="text-[10px] text-[#94A3B8] leading-tight">
                        Active recovery, mobility & muscle regeneration.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[#CBD5E1] block">
                        {isToday ? "Today's Target Session" : 'Scheduled Session'}
                      </span>
                      <p className="text-[10px] text-[#94A3B8]">
                        {isToday ? 'Tap Start Workout on Dashboard to train.' : 'Upcoming in training cycle.'}
                      </p>
                    </div>
                  )}

                  {/* Popover bottom pointer arrow */}
                  <div
                    className="absolute top-full w-2.5 h-2.5 bg-[#0F172A] border-r border-b border-white/10 rotate-45 -mt-1"
                    style={{
                      left: idx === 0 ? '16px' : idx === 6 ? 'calc(100% - 24px)' : 'calc(50% - 5px)',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
