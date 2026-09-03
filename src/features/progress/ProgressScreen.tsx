import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Activity, Sparkles, Plus, Play } from 'lucide-react';
import { useHistoryStore } from '../../stores/useHistoryStore';
import {
  calculateOverallStats,
  calculateExerciseProgressMetrics,
  calculatePersonalRecords,
} from '../../utils/analyticsCalc';
import { MetricKpiStrip } from './components/MetricKpiStrip';
import { WeeklyHeatmapStrip } from './components/WeeklyHeatmapStrip';
import { StrengthTelemetryChart } from './components/StrengthTelemetryChart';
import { PrTrophyBoard } from './components/PrTrophyBoard';

export const ProgressScreen: React.FC = () => {
  const navigate = useNavigate();
  const { completedSessions } = useHistoryStore();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('bench-press');

  const stats = calculateOverallStats(completedSessions);
  const exerciseMetrics = calculateExerciseProgressMetrics(completedSessions);
  const personalRecords = calculatePersonalRecords(completedSessions);

  // Fallback default benchmarks if user has fresh state
  const fallbackPrs = [
    {
      id: 'pr-bench',
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      metricType: 'weight' as const,
      value: '85 kg',
      weightKg: 85,
      reps: 8,
      date: Date.now() - 86400000 * 5,
    },
    {
      id: 'pr-squat',
      exerciseId: 'barbell-squat',
      exerciseName: 'Barbell Squat',
      metricType: 'weight' as const,
      value: '120 kg',
      weightKg: 120,
      reps: 5,
      date: Date.now() - 86400000 * 12,
    },
    {
      id: 'pr-deadlift',
      exerciseId: 'deadlift',
      exerciseName: 'Deadlift',
      metricType: 'weight' as const,
      value: '145 kg',
      weightKg: 145,
      reps: 5,
      date: Date.now() - 86400000 * 20,
    },
  ];

  const activePrs = personalRecords.length > 0 ? personalRecords : fallbackPrs;

  return (
    <div className="flex flex-col space-y-6 animate-fade-in select-none pb-12">
      {/* 1. Header & Live Telemetry Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#008B8E]">
              TELEMETRY ENGINE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight mt-0.5">
            Progress & Analytics
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5 font-medium">
            Overload velocity, strength curves & milestone telemetry
          </p>
        </div>

        {/* Highlight Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#D96B27]/10 border border-[#D96B27]/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#D96B27] shadow-sm">
            <Flame size={14} className="fill-current" />
            <span>{stats.thisMonthCount || 4} this month</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/workouts')}
            className="flex items-center gap-1.5 bg-[#008B8E] hover:bg-[#00A3A6] text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer uppercase tracking-wider"
          >
            <Play size={12} fill="currentColor" />
            <span className="hidden sm:inline">Log Session</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric KPI Strip (4 Cards) */}
      <MetricKpiStrip
        totalVolumeKg={stats.totalVolumeKg || 12450}
        totalSets={stats.totalSets || 20}
        weeklyWorkouts={stats.thisWeekCount || 4}
        weeklyTarget={5}
        totalPrs={activePrs.length}
        totalSessions={stats.totalWorkouts || 4}
      />

      {/* 3. Responsive 2-Column Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65% / 7 cols): Strength Chart & Weekly Heatmap */}
        <div className="lg:col-span-7 space-y-6">
          <StrengthTelemetryChart
            metrics={exerciseMetrics}
            selectedExerciseId={selectedExerciseId}
            onSelectExercise={setSelectedExerciseId}
          />

          <WeeklyHeatmapStrip sessions={completedSessions} />
        </div>

        {/* Right Column (35% / 5 cols): PR Trophy Board */}
        <div className="lg:col-span-5 space-y-6">
          <PrTrophyBoard personalRecords={activePrs} metrics={exerciseMetrics} />
        </div>
      </div>
    </div>
  );
};
