import React, { useState } from 'react';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { DashboardHeader } from './components/DashboardHeader';
import { TodaySessionCard } from './components/TodaySessionCard';
import { WeeklyProgress } from './components/WeeklyProgress';
import { QuickAccessGrid } from './components/QuickAccessGrid';
import { DashboardSkeleton } from './components/DashboardSkeleton';

export const DashboardScreen: React.FC = () => {
  const { getActiveRoutine, routines } = useRoutineStore();
  const [isLoading] = useState(false);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const activeRoutine = getActiveRoutine() || routines[0] || null;

  return (
    <div className="flex flex-col px-4 pt-6 pb-6 space-y-6 animate-fade-in">
      {/* 1. Header (Greeting & Avatar) */}
      <DashboardHeader />

      {/* 2. Today's Session Hero Card */}
      <TodaySessionCard routine={activeRoutine} isCompletedToday={false} />

      {/* 3. Weekly Progress Strip */}
      <WeeklyProgress />

      {/* 4. Quick Access Grid */}
      <QuickAccessGrid />
    </div>
  );
};
