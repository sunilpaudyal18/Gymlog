import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../ui/Logo';
import { useTodaySession } from '../../hooks/useTodaySession';
import { Play, Sparkles } from 'lucide-react';

export const MobileHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeSession, isRestDay, status, resumeWorkout } = useTodaySession();

  const isLiveWorkout = status === 'in_progress' && activeSession && !isRestDay;

  // Omit on live workout modes
  const isWorkoutSessionMode =
    location.pathname === '/workout-mode' ||
    location.pathname.startsWith('/workout-mode') ||
    location.pathname === '/workout-complete';

  if (isWorkoutSessionMode) return null;

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#CBD5E1]/60 px-4 py-2 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between h-9">
        {/* Brand Micro-Lockup (Height strictly 28-32px) */}
        <Logo
          variant="compact"
          markClassName="h-7 w-auto"
          onClick={() => navigate('/')}
        />

        {/* Quick Context Action / Status */}
        <div className="flex items-center gap-2">
          {isLiveWorkout ? (
            <button
              type="button"
              onClick={resumeWorkout}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#008B8E] text-white text-[11px] font-bold rounded-full shadow-sm hover:bg-[#00A3A6] transition-all cursor-pointer animate-pulse"
            >
              <Play size={11} fill="currentColor" />
              <span>Resume</span>
            </button>
          ) : (
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[10px] font-bold text-[#475569] cursor-pointer hover:text-[#0F172A]"
            >
              <Sparkles size={10} className="text-[#008B8E]" />
              <span className="tracking-wider uppercase">ATHLETE</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
