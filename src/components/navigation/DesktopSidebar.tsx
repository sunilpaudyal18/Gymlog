import React from 'react';
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
  Database,
  CheckCircle2,
} from 'lucide-react';
import { useWorkoutStore } from '../../stores/useWorkoutStore';
import { useRoutineStore } from '../../stores/useRoutineStore';

export const DesktopSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSession } = useWorkoutStore();
  const { getActiveRoutine } = useRoutineStore();
  const activeRoutine = getActiveRoutine();

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
      <div className="p-6 border-b border-[#CBD5E1]/60 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008B8E] to-[#B4FF39] flex items-center justify-center text-white font-black text-xl shadow-md">
            G
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[#0F172A] block leading-none">
              GYM
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#008B8E] uppercase">
              KINETIC COMPANION
            </span>
          </div>
        </div>
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
              {item.path === '/workouts' && activeSession && (
                <span className="ml-auto w-2 h-2 rounded-full bg-[#B4FF39] animate-ping" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Active Workout Widget / Quick Start */}
      <div className="p-4 border-t border-[#CBD5E1]/60 space-y-3">
        {activeSession ? (
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
              onClick={() => navigate('/workout-mode')}
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
              {activeRoutine ? activeRoutine.name : 'Select a Routine'}
            </span>
            <button
              type="button"
              onClick={() => {
                if (activeRoutine) {
                  navigate(`/workout/${activeRoutine.id}`);
                } else {
                  navigate('/workouts');
                }
              }}
              className="w-full py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Play size={13} fill="currentColor" />
              <span>Start Workout</span>
            </button>
          </div>
        )}

        {/* Local Storage / Privacy Pill */}
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <Database size={13} className="text-[#008B8E]" />
            <span className="font-semibold">Local Storage</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#10B981]">
            <CheckCircle2 size={11} />
            100% PRIVATE
          </span>
        </div>
      </div>
    </aside>
  );
};
