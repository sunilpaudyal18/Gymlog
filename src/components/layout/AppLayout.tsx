import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '../navigation/BottomNav';
import { DesktopSidebar } from '../navigation/DesktopSidebar';
import { MobileHeader } from '../navigation/MobileHeader';
import { OfflineBanner } from '../feedback/OfflineBanner';

export const AppLayout: React.FC = () => {
  const location = useLocation();

  // Hide floating navbar on active workout modes (Workout Mode, Rest Timer, Workout Complete)
  const isWorkoutSessionMode =
    location.pathname === '/workout-mode' ||
    location.pathname.startsWith('/workout-mode') ||
    location.pathname === '/workout-complete';

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#0F172A] flex flex-row selection:bg-[#008B8E] selection:text-white">
      {/* Desktop Workspace Sidebar (Visible on screens >= 1024px) */}
      {!isWorkoutSessionMode && <DesktopSidebar />}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Offline Status Bar */}
        <OfflineBanner />

        {/* Mobile Top Brand Header (< 1024px) */}
        {!isWorkoutSessionMode && <MobileHeader />}

        {/* Main Viewport Container */}
        <main
          className={`flex-1 w-full mx-auto relative overflow-y-auto ${
            isWorkoutSessionMode
              ? 'max-w-2xl px-4 py-4 pb-8'
              : 'max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-4 lg:py-6 pb-32 lg:pb-12'
          }`}
        >
          <Outlet />
        </main>

        {/* Floating Bottom Navigation Bar (Hidden on desktop lg: and during active workout session) */}
        {!isWorkoutSessionMode && (
          <div className="lg:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
};

