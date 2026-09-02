import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../../stores/useUserStore';

export const DashboardHeader: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useUserStore();

  // Helper to determine greeting based on hour of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      return 'Good afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'Good evening';
    } else {
      return 'Good night';
    }
  };

  const [greeting, setGreeting] = useState<string>(getGreeting());

  // Real-time reactive interval & visibility listener
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    updateGreeting();

    // Re-check every 30 seconds
    const interval = setInterval(updateGreeting, 30000);

    // Re-check immediately when user returns to app/tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateGreeting();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="relative pt-3 pb-5 select-none">
      {/* Ambient Background Lighting - Soft Teal Light Leak */}
      <div
        className="absolute -top-4 -left-6 w-56 h-36 rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0, 139, 142, 0.08) 0%, rgba(0, 139, 142, 0.02) 50%, rgba(244, 246, 249, 0) 75%)',
          filter: 'blur(16px)',
        }}
      />

      {/* Dual-Axis Alignment Layout */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left: Greeting on top, User Name prominent below */}
        <div className="min-w-0 flex-1">
          {/* Greeting message on upper line */}
          <span className="text-xs font-bold uppercase tracking-wider text-[#008B8E] block mb-0.5">
            {greeting},
          </span>

          {/* User Name in large, bold typography with live status indicator */}
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] tracking-tight truncate">
              {profile.name || 'Alex'}
            </h1>
            {/* Live Telemetry Status Dot with Pulse */}
            <span className="relative flex h-2.5 w-2.5 shrink-0" title="Live telemetry active">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#008B8E] opacity-75" />
              <span
                className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#008B8E]"
                style={{
                  boxShadow: '0 0 8px #008B8E, 0 0 12px rgba(0, 139, 142, 0.6)',
                }}
              />
            </span>
          </div>

          {/* Motivational Subtitle / Metric Callout */}
          <p className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider mt-1 flex items-center gap-1.5 truncate">
            <span>PHASE 2</span>
            <span className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
            <span>HYPERTROPHY WEEK 3</span>
          </p>
        </div>

        {/* Right: Borderless, Extra-Clear & Enlarged Profile Photo */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="relative w-16 h-16 rounded-2xl shrink-0 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group focus:outline-none shadow-sm hover:shadow-md overflow-hidden bg-white"
          aria-label="View Profile"
          title="Open Profile"
        >
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-[#008B8E]/10 flex items-center justify-center font-bold text-lg text-[#008B8E]">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
