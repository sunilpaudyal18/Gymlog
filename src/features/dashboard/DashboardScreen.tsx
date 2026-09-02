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
    <div className="flex flex-col space-y-6 animate-fade-in">
      {/* 1. Header (Greeting & Avatar) */}
      <DashboardHeader />

      {/* 2. Responsive 2-Column Grid on Tablet/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Primary Column: Hero Card & Weekly Progress */}
        <div className="lg:col-span-7 space-y-6">
          <TodaySessionCard routine={activeRoutine} isCompletedToday={false} />
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

