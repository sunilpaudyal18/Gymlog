import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Award,
  Dumbbell,
  Trophy,
  Check,
  Flame,
} from 'lucide-react';
import { useHistoryStore } from '../../stores/useHistoryStore';
import {
  calculateOverallStats,
  calculateWeeklyConsistency,
  calculateExerciseProgressMetrics,
  calculatePersonalRecords,
} from '../../utils/analyticsCalc';
import { EmptyState } from '../../components/feedback/EmptyState';

export const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { completedSessions } = useHistoryStore();

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('bench-press');

  const stats = calculateOverallStats(completedSessions);
  const weeklyDays = calculateWeeklyConsistency(completedSessions);
  const exerciseMetrics = calculateExerciseProgressMetrics(completedSessions);
  const personalRecords = calculatePersonalRecords(completedSessions);

  const selectedMetric =
    exerciseMetrics.find((m) => m.exerciseId === selectedExerciseId) ||
    exerciseMetrics[0];

  const hasData = completedSessions.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col px-4 pt-6 pb-20 space-y-5 animate-fade-in select-none">
        <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Progress</h1>
        <EmptyState
          icon={<TrendingUp size={36} />}
          title="Start building your progress"
          description="Complete your first workout and your performance stats, strength progression charts, and personal records will appear here."
          actionLabel="START A WORKOUT"
          onAction={() => navigate('/workouts')}
        />
      </div>
    );
  }

  // Generate SVG Path for Strength Progression Chart
  const historyPoints = selectedMetric?.historyPoints || [];
  const svgWidth = 320;
  const svgHeight = 120;
  const padding = 20;

  let polylinePoints = '';
  let areaPoints = '';

  if (historyPoints.length >= 2) {
    const minWeight = Math.min(...historyPoints.map((p) => p.weightKg)) * 0.9;
    const maxWeight = Math.max(...historyPoints.map((p) => p.weightKg)) * 1.1;
    const range = maxWeight - minWeight || 1;

    const coords = historyPoints.map((p, idx) => {
      const x = padding + (idx / (historyPoints.length - 1)) * (svgWidth - 2 * padding);
      const y =
        svgHeight -
        padding -
        ((p.weightKg - minWeight) / range) * (svgHeight - 2 * padding);
      return { x, y };
    });

    polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
    areaPoints = `${coords[0].x},${svgHeight} ${polylinePoints} ${
      coords[coords.length - 1].x
    },${svgHeight}`;
  }

  return (
    <div className="flex flex-col px-4 pt-6 pb-24 space-y-6 animate-fade-in select-none">
      {/* 1. Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] tracking-tight">Progress</h1>
          <p className="text-xs text-[#475569] mt-0.5 font-medium">
            Strength progression & analytics
          </p>
        </div>

        {/* Highlight badge using Burnt Energy Amber */}
        <div className="flex items-center gap-1.5 bg-[#D96B27]/10 border border-[#D96B27]/30 px-3 py-1.5 rounded-full text-xs font-bold text-[#D96B27] shadow-sm">
          <Flame size={14} className="fill-current" />
          <span>{stats.thisMonthCount} this month</span>
        </div>
      </div>

      {/* 2. Overview Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Volume */}
        <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#475569] text-xs font-bold uppercase">
            <Dumbbell size={14} className="text-[#008B8E]" />
            <span>Total Volume</span>
          </div>
          <span className="text-2xl font-bold font-mono-metric text-[#0F172A] mt-1 block">
            {(stats.totalVolumeKg || 0).toLocaleString()} kg
          </span>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">
            Across {stats.totalWorkouts} sessions
          </span>
        </div>

        {/* Total Sets */}
        <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-2 text-[#475569] text-xs font-bold uppercase">
            <Trophy size={14} className="text-[#D96B27]" />
            <span>Total Sets</span>
          </div>
          <span className="text-2xl font-bold font-mono-metric text-[#0F172A] mt-1 block">
            {stats.totalSets}
          </span>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">
            {stats.totalDurationMin} min trained
          </span>
        </div>
      </div>

      {/* 3. Weekly Consistency Strip */}
      <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4.5 space-y-3 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            WEEKLY CONSISTENCY
          </span>
          <span className="text-xs font-bold text-[#008B8E]">
            {stats.thisWeekCount} workouts this week
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weeklyDays.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-[#475569]">
                {day.short}
              </span>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                  day.hasWorkout
                    ? 'bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E] shadow-sm'
                    : day.isToday
                    ? 'border-2 border-[#CBD5E1] bg-white text-[#0F172A]'
                    : 'bg-[#F1F5F9] text-transparent border border-[#CBD5E1]'
                }`}
              >
                {day.hasWorkout ? (
                  <Check size={16} className="stroke-[3]" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Strength Progression Chart */}
      <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4.5 space-y-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569] block">
              STRENGTH PROGRESSION
            </span>
            <h3 className="text-lg font-bold text-[#0F172A] mt-0.5">
              {selectedMetric?.exerciseName || 'Bench Press'}
            </h3>
          </div>

          {selectedMetric && (
            <span
              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                selectedMetric.trend === 'improving'
                  ? 'bg-[#008B8E]/10 text-[#008B8E] border-[#008B8E]/30'
                  : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
              }`}
            >
              {selectedMetric.trend === 'improving' ? '↑ Improving' : 'Stable'}
            </span>
          )}
        </div>

        {/* Exercise Quick Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {exerciseMetrics.map((ex) => (
            <button
              key={ex.exerciseId}
              type="button"
              onClick={() => setSelectedExerciseId(ex.exerciseId)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer border shadow-sm ${
                selectedExerciseId === ex.exerciseId
                  ? 'bg-[#008B8E] text-white border-[#008B8E] font-bold'
                  : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
              }`}
            >
              {ex.exerciseName}
            </button>
          ))}
        </div>

        {/* Chart Canvas */}
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0]">
          {historyPoints.length >= 2 ? (
            <div className="w-full">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-32">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008B8E" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#008B8E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area under curve */}
                <polygon points={areaPoints} fill="url(#chartGrad)" />

                {/* Main line */}
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke="#008B8E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data point dots */}
                {historyPoints.map((p, idx) => {
                  const minWeight = Math.min(...historyPoints.map((pt) => pt.weightKg)) * 0.9;
                  const maxWeight = Math.max(...historyPoints.map((pt) => pt.weightKg)) * 1.1;
                  const range = maxWeight - minWeight || 1;
                  const cx = padding + (idx / (historyPoints.length - 1)) * (svgWidth - 2 * padding);
                  const cy = svgHeight - padding - ((p.weightKg - minWeight) / range) * (svgHeight - 2 * padding);

                  return (
                    <circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="4"
                      className="fill-[#008B8E] stroke-white stroke-2"
                    />
                  );
                })}
              </svg>

              <div className="flex justify-between items-center text-[10px] font-bold text-[#475569] pt-1">
                <span>First Session</span>
                <span className="text-[#008B8E]">
                  Best: {selectedMetric?.heaviestWeightKg} kg • Est 1RM: {selectedMetric?.estimated1RMKg} kg
                </span>
                <span>Latest</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-[#64748B]">
              <span>Need 2+ completed workouts for this exercise to render the trend line.</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Personal Records (PRs) List with Burnt Energy Amber Highlight */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
          PERSONAL RECORDS (PRs)
        </span>

        <div className="space-y-2">
          {personalRecords.map((pr) => (
            <div
              key={pr.id}
              className="bg-white/80 border border-[#CBD5E1] hover:border-[#94A3B8] p-4 rounded-2xl flex items-center justify-between transition-all shadow-sm backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D96B27]/10 text-[#D96B27] flex items-center justify-center shadow-sm border border-[#D96B27]/30">
                  <Award size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] tracking-tight">
                    {pr.exerciseName}
                  </h4>
                  <p className="text-xs text-[#475569] mt-0.5">
                    {pr.weightKg} kg × {pr.reps} reps
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-mono-metric font-bold text-[#D96B27] block">
                  {pr.value}
                </span>
                <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                  Top Lift
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
