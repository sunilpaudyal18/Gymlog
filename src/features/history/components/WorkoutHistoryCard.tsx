import React from 'react';
import { Timer, ListChecks, ChevronRight, Dumbbell } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { WorkoutSession } from '../../../types';

export interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  onClick: (session: WorkoutSession) => void;
}

export const WorkoutHistoryCard: React.FC<WorkoutHistoryCardProps> = ({ session, onClick }) => {
  const dateObj = new Date(session.completedAt || session.startedAt);

  let dateLabel = format(dateObj, 'dd MMM yyyy');
  if (isToday(dateObj)) {
    dateLabel = `Today, ${format(dateObj, 'hh:mm a')}`;
  } else if (isYesterday(dateObj)) {
    dateLabel = `Yesterday, ${format(dateObj, 'hh:mm a')}`;
  }

  const durationMin = Math.max(1, Math.round(session.durationSeconds / 60));
  const exercisesCount = session.exercises.length;
  const setsCount = session.totalSetsCompleted;
  const volumeKg = session.totalVolumeKg || 0;

  return (
    <div
      onClick={() => onClick(session)}
      className="bg-white/80 border border-[#CBD5E1] hover:border-[#94A3B8] p-4.5 rounded-2xl flex flex-col space-y-3.5 transition-all cursor-pointer group shadow-sm select-none backdrop-blur-md"
    >
      {/* Header: Routine Name & Date */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#008B8E] transition-colors tracking-tight">
            {session.routineName}
          </h3>
          <span className="text-xs text-[#475569] font-medium block mt-0.5">
            {dateLabel}
          </span>
        </div>

        <div className="w-7 h-7 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] group-hover:bg-[#008B8E] group-hover:text-white flex items-center justify-center text-[#64748B] transition-colors">
          <ChevronRight size={16} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center">
        {/* Duration */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Timer size={11} className="text-[#008B8E]" />
            <span>Time</span>
          </div>
          <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5">
            {durationMin} min
          </span>
        </div>

        {/* Exercises / Sets */}
        <div className="flex flex-col items-center justify-center border-x border-[#E2E8F0]">
          <div className="flex items-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <ListChecks size={11} className="text-[#008B8E]" />
            <span>Sets</span>
          </div>
          <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5">
            {exercisesCount} ex • {setsCount} sets
          </span>
        </div>

        {/* Volume */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-[#475569] text-[10px] font-bold uppercase">
            <Dumbbell size={11} className="text-[#008B8E]" />
            <span>Volume</span>
          </div>
          <span className="text-xs font-mono-metric font-bold text-[#0F172A] mt-0.5">
            {volumeKg.toLocaleString()} kg
          </span>
        </div>
      </div>
    </div>
  );
};
