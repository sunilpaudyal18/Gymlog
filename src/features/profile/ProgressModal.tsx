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
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useHistoryStore } from '../../stores/useHistoryStore';
import {
  calculateOverallStats,
  calculateWeeklyConsistency,
  calculatePersonalRecords,
  calculateMuscleDistribution,
} from '../../utils/analyticsCalc';

export interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { completedSessions } = useHistoryStore();

  const stats = calculateOverallStats(completedSessions);
  const weeklyDays = calculateWeeklyConsistency(completedSessions);
  const personalRecords = calculatePersonalRecords(completedSessions);
  const muscleDistribution = calculateMuscleDistribution(completedSessions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Progress & Performance" type="sheet">
      <div className="space-y-4 select-none pt-1">
        {/* 1. Key Metrics 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#475569]">
              <Dumbbell size={14} className="text-[#008B8E]" />
              <span>Volume</span>
            </div>
            <span className="font-mono-metric font-bold text-lg text-[#0F172A] mt-1 block">
              {(stats.totalVolumeKg || 0).toLocaleString()} kg
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">
              Across {stats.totalWorkouts} sessions
            </span>
          </div>

          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-3.5 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-[#475569]">
              <Trophy size={14} className="text-[#D96B27]" />
              <span>Total Sets</span>
            </div>
            <span className="font-mono-metric font-bold text-lg text-[#0F172A] mt-1 block">
              {stats.totalSets}
            </span>
            <span className="text-[10px] text-[#64748B] block mt-0.5">
              {stats.totalDurationMin} min total
            </span>
          </div>
        </div>

        {/* 2. Weekly Consistency */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Weekly Consistency
            </span>
            <span className="text-xs font-bold text-[#008B8E]">
              {stats.thisWeekCount} this week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center">
            {weeklyDays.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#475569]">
                  {day.short}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    day.hasWorkout
                      ? 'bg-[#008B8E]/12 text-[#008B8E] border border-[#008B8E]'
                      : day.isToday
                      ? 'border-2 border-[#CBD5E1] bg-white text-[#0F172A]'
                      : 'bg-[#F1F5F9] text-transparent border border-[#CBD5E1]'
                  }`}
                >
                  {day.hasWorkout ? (
                    <Check size={14} className="stroke-[3]" />
                  ) : (
                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Top Personal Records */}
        {personalRecords.length > 0 && (
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#475569]">
                <Flame size={14} className="text-[#D96B27]" />
                <span>Personal Records</span>
              </div>
              <span className="text-[10px] font-bold text-[#D96B27]">
                {personalRecords.length} PRs
              </span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {personalRecords.map((pr) => (
                <div
                  key={pr.id}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <Award size={14} className="text-[#D96B27] shrink-0" />
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

        {/* 4. Muscle Focus Distribution */}
        {muscleDistribution.length > 0 && (
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#475569]">
              <Activity size={14} className="text-[#008B8E]" />
              <span>Target Muscle Balance</span>
            </div>

            <div className="space-y-2 pt-1">
              {muscleDistribution.slice(0, 4).map((m) => (
                <div key={m.muscle} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] capitalize">
                      {m.muscle}
                    </span>
                    <span className="font-mono-metric font-bold text-[#008B8E]">
                      {m.percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden border border-[#CBD5E1]">
                    <div
                      className="bg-[#008B8E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action button to full screen progression charts */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate('/progress');
            }}
            className="w-full bg-[#008B8E] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00A3A6] shadow-sm uppercase tracking-wider text-xs cursor-pointer transition-all"
          >
            <span>Open Detailed Analytics Page</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </Modal>
  );
};
