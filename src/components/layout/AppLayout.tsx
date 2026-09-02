import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../navigation/BottomNav';
import { OfflineBanner } from '../feedback/OfflineBanner';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  // Hide floating navbar on active workout modes (Workout Mode, Rest Timer, Workout Complete)
  // so that timer controls, complete set actions, and upcoming set cards are never obscured
  const isWorkoutSessionMode =
    location.pathname === '/workout-mode' ||
    location.pathname.startsWith('/workout-mode') ||
    location.pathname === '/workout-complete';

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A] flex flex-col justify-between selection:bg-[#008B8E] selection:text-white">
      {/* Offline Status Bar */}
      <OfflineBanner />

      {/* Main Content Area Container - Centered max width on desktop with generous bottom padding so content is never hidden behind floating navbar */}
      <main
        className={`flex-1 w-full max-w-md mx-auto relative overflow-y-auto ${
          isWorkoutSessionMode ? 'pb-8' : 'pb-32'
        }`}
      >
        <Outlet />
      </main>

      {/* Floating Bottom Navigation Bar (Hidden during active workout session) */}
      {!isWorkoutSessionMode && <BottomNav />}
    </div>
  );
};
