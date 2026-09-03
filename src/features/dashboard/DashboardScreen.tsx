import React, { useState } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { DashboardHeader } from './components/DashboardHeader';
import { TodaySessionCard } from './components/TodaySessionCard';
import { WeeklyProgress } from './components/WeeklyProgress';
import { QuickAccessGrid } from './components/QuickAccessGrid';
import { DashboardSkeleton } from './components/DashboardSkeleton';
import { isSameCalendarDay } from '../../utils/scheduler';

export const DashboardScreen: React.FC = () => {
  const { getTodayScheduledRoutine } = useRoutineStore();
  const { completedSessions } = useHistoryStore();
  const [isLoading] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Check if a workout has already been completed today
  const isCompletedToday = completedSessions.some((s) =>
    isSameCalendarDay(s.completedAt || s.startedAt, new Date())
  );

  // Dynamically load today's scheduled routine
  const scheduledRoutine = getTodayScheduledRoutine();

  return (
    <div className="flex flex-col space-y-6 animate-fade-in">
      {/* 1. Header (Greeting & Avatar) */}
      <DashboardHeader />

      {/* 2. Responsive 2-Column Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Primary Column: Hero Card & Weekly Progress */}
        <div className="lg:col-span-7 space-y-6">
          <TodaySessionCard
            routine={scheduledRoutine}
            isCompletedToday={isCompletedToday}
          />
          <WeeklyProgress />
        </div>

        {/* Right Secondary Column: Quick Access & Stats */}
        <div className="lg:col-span-5 space-y-6">
          <QuickAccessGrid />
        </div>
      </div>
    </div>
  );
};
