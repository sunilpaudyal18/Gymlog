import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

export interface DayProgress {
  day: 'M' | 'T' | 'W' | 'T' | 'F' | 'S' | 'S';
  completed: boolean;
  isToday?: boolean;
  dateStr?: string;
}

export interface WeeklyProgressProps {
  days?: DayProgress[];
  onDetailsClick?: () => void;
}

const DEFAULT_WEEK_DAYS: DayProgress[] = [
  { day: 'M', completed: true },
  { day: 'T', completed: true },
  { day: 'W', completed: true, isToday: true },
  { day: 'T', completed: false },
  { day: 'F', completed: false },
  { day: 'S', completed: false },
  { day: 'S', completed: false },
];

export const WeeklyProgress: React.FC<WeeklyProgressProps> = ({
  days = DEFAULT_WEEK_DAYS,
  onDetailsClick,
}) => {
  const navigate = useNavigate();

  const handleDetails = () => {
    if (onDetailsClick) {
      onDetailsClick();
    } else {
      navigate('/progress');
    }
  };

  return (
    <div className="space-y-3 select-none">
      {/* 1. Header & Meta Link */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
          Weekly Progress
        </h3>
        <button
          type="button"
          onClick={handleDetails}
          className="text-xs font-bold text-[#008B8E] hover:underline hover:brightness-110 cursor-pointer tracking-tight transition-all"
        >
          Details
        </button>
      </div>

      {/* 2. Glass Strip Container */}
      <div
        className="relative rounded-3xl p-4 flex items-center justify-between overflow-hidden border border-[#CBD5E1]/60 shadow-sm"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.88) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow:
            '0 8px 24px -4px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
        }}
      >
        {/* Surface Highlight: Light diagonal glare streak */}
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.05)_35%,transparent_60%)] pointer-events-none" />

        {/* Specular linear highlight along top edge */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

        {/* 3. Day Node States */}
        {days.map((d, index) => {
          const isCompleted = d.completed;
          const isToday = d.isToday;

          return (
            <div key={index} className="relative flex flex-col items-center gap-2 z-10">
              {/* Day Label (M T W T F S S) */}
              <span
                className={`text-xs font-bold transition-colors ${
                  isToday
                    ? 'text-[#008B8E] font-black'
                    : isCompleted
                    ? 'text-[#0F172A]'
                    : 'text-[#64748B]'
                }`}
              >
                {d.day}
              </span>

              {/* Day Node Badge */}
              <div
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isCompleted
                    ? 'text-[#008B8E]'
                    : isToday
                    ? 'text-[#008B8E]'
                    : 'text-transparent'
                }`}
                style={{
                  background: isCompleted
                    ? 'rgba(0, 139, 142, 0.12)'
                    : isToday
                    ? 'rgba(0, 139, 142, 0.15)'
                    : 'rgba(241, 245, 249, 0.8)',
                  border: isCompleted
                    ? '1.5px solid #008B8E'
                    : isToday
                    ? '1.5px solid #008B8E'
                    : '1px solid rgba(203, 213, 225, 0.7)',
                  boxShadow: isCompleted
                    ? '0 0 8px rgba(0, 139, 142, 0.25)'
                    : isToday
                    ? '0 0 10px rgba(0, 139, 142, 0.3)'
                    : undefined,
                }}
              >
                {/* Active Today Pulse Ring */}
                {isToday && (
                  <span className="absolute inset-0 rounded-full border border-[#008B8E] animate-ping opacity-35" />
                )}

                {/* Checkmark Icon on Completed Days */}
                {isCompleted ? (
                  <Check
                    size={14}
                    className="stroke-[3]"
                  />
                ) : isToday ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008B8E] shadow-[0_0_6px_#008B8E]" />
                ) : (
                  <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                )}
              </div>

              {/* Active Today Neon Under-Glow Line */}
              {isToday && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                  <div
                    className="w-5 h-[2px] rounded-full bg-[#008B8E]"
                    style={{
                      boxShadow:
                        '0 0 6px #008B8E, 0 0 8px rgba(0, 139, 142, 0.7)',
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
