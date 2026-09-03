import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  History,
  TrendingUp,
  User,
  Settings,
  Play,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useTodaySession } from '../../hooks/useTodaySession';

export const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    routineName,
    status,
    isRestDay,
    activeSession,
    startWorkout,
    resumeWorkout,
  } = useTodaySession();

  const isLiveWorkout = status === 'in_progress' && activeSession && !isRestDay;

  const navItems = [
    {
      path: '/',
      label: 'Home / Today',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      path: '/workouts',
      label: 'Workouts & Routines',
      icon: Dumbbell,
      exact: false,
    },
    {
      path: '/exercises',
      label: 'Exercise Library',
      icon: BookOpen,
      exact: false,
    },
    {
      path: '/history',
      label: 'Workout History',
      icon: History,
      exact: false,
    },
    {
      path: '/progress',
      label: 'Progress & Analytics',
      icon: TrendingUp,
      exact: false,
    },
    {
      path: '/profile',
      label: 'Profile & Goals',
      icon: User,
      exact: true,
    },
    {
      path: '/settings',
      label: 'Settings & Backup',
      icon: Settings,
      exact: false,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white/85 border-r border-[#CBD5E1] backdrop-blur-md sticky top-0 h-screen select-none z-30 shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-[#CBD5E1]/60 flex items-center justify-start">
        <Logo
          variant="full"
          markClassName="h-8 w-auto"
          onClick={() => navigate('/')}
        />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#008B8E] text-white shadow-md shadow-[#008B8E]/20 translate-x-1'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white stroke-[2.5]' : 'text-[#64748B]'} />
              <span className="tracking-wide">{item.label}</span>
              {item.path === '/workouts' && isLiveWorkout && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#B4FF39] animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Workout Widget / Quick Start */}
      <div className="p-4 border-t border-[#CBD5E1]/60 space-y-3">
        {isLiveWorkout ? (
          <div className="bg-[#008B8E]/10 border border-[#008B8E]/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008B8E] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                WORKOUT IN PROGRESS
              </span>
            </div>
            <span className="text-xs font-bold text-[#0F172A] block truncate">
              {activeSession.routineName}
            </span>
            <button
              type="button"
              onClick={resumeWorkout}
              className="w-full py-2 bg-[#008B8E] hover:bg-[#00A3A6] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Play size={13} fill="currentColor" />
              <span>Resume Session</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-3 space-y-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
              TODAY'S TARGET
            </span>
            <span className="text-xs font-bold text-[#0F172A] block truncate">
              {routineName}
            </span>
            <button
              type="button"
              onClick={startWorkout}
              className="w-full py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Play size={13} fill="currentColor" />
              <span>{isRestDay ? 'Choose Routine' : 'Start Workout'}</span>
            </button>
          </div>
        )}

        {/* Creator Attribution */}
        <div className="flex items-center justify-center pt-1 text-[11px] text-[#64748B]">
          <span>
            Built by{' '}
            <a
              href="https://sunilpaudyal.com.np"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#0F172A] hover:text-[#008B8E] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
            >
              <span>Sunil Paudyal</span>
              <span className="text-[10px] text-[#008B8E] font-extrabold">↗</span>
            </a>
          </span>
        </div>
      </div>
    </aside>
  );
};
