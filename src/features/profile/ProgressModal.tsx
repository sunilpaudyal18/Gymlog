import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Dumbbell,
  Trophy,
  Check,
  Flame,
  Award,
  ArrowRight,
  Activity,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useHistoryStore } from '../../stores/useHistoryStore';
import {
  calculateOverallStats,
  calculatePersonalRecords,
  calculateMuscleDistribution,
} from '../../utils/analyticsCalc';
import { getCurrentWeekDays, isSameCalendarDay } from '../../utils/scheduler';

export interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { completedSessions } = useHistoryStore();

  const stats = calculateOverallStats(completedSessions);
  const personalRecords = calculatePersonalRecords(completedSessions);
  const muscleDistribution = calculateMuscleDistribution(completedSessions);
  const currentWeek = getCurrentWeekDays();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Progress & Performance Telemetry" type="sheet">
      <div className="space-y-4 select-none pt-1">
        {/* 1. Key Metrics 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-[#F8FAFC] border border-[#CBD5E1]/70 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#475569]">
                <Dumbbell size={14} className="text-[#008B8E]" />
                <span>Volume</span>
              </div>
              <span className="text-[9px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-1.5 py-0.5 rounded-md">
                +14%
              </span>
            </div>
            <span className="font-mono-metric font-bold text-xl text-[#0F172A] mt-1.5 block">
              {(stats.totalVolumeKg || 0).toLocaleString()}{' '}
              <span className="text-xs font-semibold text-[#64748B] font-sans">kg</span>
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              Across {stats.totalWorkouts} workouts
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-[#CBD5E1]/70 rounded-2xl p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#475569]">
                <Trophy size={14} className="text-[#D96B27]" />
                <span>Total Sets</span>
              </div>
              <span className="text-[9px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-1.5 py-0.5 rounded-md">
                Workload
              </span>
            </div>
            <span className="font-mono-metric font-bold text-xl text-[#0F172A] mt-1.5 block">
              {stats.totalSets}{' '}
              <span className="text-xs font-semibold text-[#64748B] font-sans">sets</span>
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5">
              {stats.totalDurationMin} min total
            </span>
          </div>
        </div>

        {/* 2. Dynamic Weekly Consistency Strip */}
        <div className="bg-white border border-[#CBD5E1]/70 rounded-2xl p-4 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
                Weekly Consistency
              </span>
            </div>
            <span className="text-xs font-bold text-[#008B8E]">
              {stats.thisWeekCount} completed this week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center relative pt-1">
            {currentWeek.map((node, idx) => {
              const hasWorkout = completedSessions.some((s) =>
                isSameCalendarDay(s.completedAt || s.startedAt, node.date)
              );

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span
                    className={`text-[10px] font-bold ${
                      node.isToday
                        ? 'text-[#008B8E]'
                        : hasWorkout
                        ? 'text-[#0F172A]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {node.dayLabel}
                  </span>
                  <div
                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      hasWorkout
                        ? 'bg-[#008B8E] text-white shadow-xs'
                        : node.isToday
                        ? 'border-2 border-[#008B8E] bg-white text-[#008B8E]'
                        : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#CBD5E1]/60'
                    }`}
                  >
                    {node.isToday && (
                      <span className="absolute inset-0 rounded-xl border border-[#B4FF39] animate-ping opacity-40 pointer-events-none" />
                    )}
                    {hasWorkout ? (
                      <Check size={14} className="stroke-[3] text-[#B4FF39]" />
                    ) : node.isToday ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#008B8E]" />
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                    )}
                  </div>
                  {node.isToday && <div className="w-3 h-[1.5px] rounded-full bg-[#008B8E]" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Top Personal Records */}
        {personalRecords.length > 0 && (
          <div className="bg-white border border-[#CBD5E1]/70 rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#475569]">
                <Flame size={14} className="text-[#D96B27]" />
                <span>Verified Milestones</span>
              </div>
              <span className="text-[10px] font-bold text-[#D96B27] bg-[#D96B27]/10 px-2 py-0.5 rounded-full border border-[#D96B27]/25">
                {personalRecords.length} PRs
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#008B8E]/40 transition-colors"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Award size={15} className="text-[#D96B27] shrink-0" />
                    <span className="text-xs font-bold text-[#0F172A] truncate">
                      {pr.exerciseName}
                    </span>
                  </div>
                  <span className="text-xs font-mono-metric font-bold text-[#D96B27] shrink-0">
                    {pr.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Target Muscle Balance */}
        {muscleDistribution.length > 0 && (
          <div className="bg-white border border-[#CBD5E1]/70 rounded-2xl p-4 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#475569]">
              <Activity size={14} className="text-[#008B8E]" />
              <span>Target Muscle Balance</span>
            </div>

            <div className="space-y-2 pt-1">
              {muscleDistribution.slice(0, 4).map((m) => (
                <div key={m.muscle} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] capitalize">{m.muscle}</span>
                    <span className="font-mono-metric font-bold text-[#008B8E]">{m.percentage}%</span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#CBD5E1]/60">
                    <div
                      className="bg-gradient-to-r from-[#008B8E] to-[#00A3A6] h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button to full telemetry page */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/progress');
            }}
            className="w-full bg-[#008B8E] hover:bg-[#00A3A6] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm uppercase tracking-wider text-xs cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>Open Detailed Analytics Page</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
