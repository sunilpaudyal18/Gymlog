import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkoutStore } from '../../stores/useWorkoutStore';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSession } = useWorkoutStore();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: (isActive: boolean) => (
        <svg
          className="w-[18px] h-[18px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? '2.4' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 10.5L12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5H15v-6a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v6H4.5A1.5 1.5 0 0 1 3 20V10.5z" />
        </svg>
      ),
    },
    {
      path: '/workouts',
      label: 'Workout',
      icon: (isActive: boolean) => (
        <svg
          className="w-[18px] h-[18px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? '2.4' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8.5" y1="6" x2="21" y2="6" />
          <line x1="8.5" y1="12" x2="21" y2="12" />
          <line x1="8.5" y1="18" x2="21" y2="18" />
          <circle cx="3.75" cy="6" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="3.75" cy="12" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="3.75" cy="18" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      path: '/exercises',
      label: 'Exercises',
      icon: (isActive: boolean) => (
        <svg
          className="w-[18px] h-[18px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? '2.2' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="11" width="3.5" height="9" rx="1.75" fill="none" />
          <rect x="10.25" y="4.5" width="3.5" height="15.5" rx="1.75" fill="none" />
          <rect x="17" y="8" width="3.5" height="12" rx="1.75" fill="none" />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (isActive: boolean) => (
        <svg
          className="w-[18px] h-[18px] transition-transform duration-200"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isActive ? '2.4' : '2'}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="7.5" r="4" />
          <path d="M5 20.5a7 7 0 0 1 14 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto select-none">
      {/* Background gradient shield: spans wide with sleek bottom alignment */}
      <div className="max-w-md mx-auto px-2 pt-2 pb-1.5 bg-gradient-to-t from-[#F4F6F9] from-80% via-[#F4F6F9]/90 to-transparent">
        {/* Aetheric Quartz Glass Floating Container (Wider pill with slim height) */}
        <nav
          className="relative rounded-2xl px-1.5 py-1.5 flex items-center justify-around border border-[#CBD5E1] shadow-lg"
          style={{
            background:
              'linear-gradient(180deg, rgba(255, 255, 255, 0.97) 0%, rgba(248, 250, 252, 0.92) 100%)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            boxShadow:
              '0 10px 25px -4px rgba(15, 23, 42, 0.1), 0 0 16px -2px rgba(0, 139, 142, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
          }}
        >
          {/* Specular linear highlight across top glass surface */}
          <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

          {/* Ambient subtle light sheen */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />

          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className="group relative flex-1 flex flex-col items-center justify-center py-1 px-1 transition-all duration-200 cursor-pointer"
              >
                {/* Active Session Ping Indicator on Workout tab */}
                {item.path === '/workouts' && activeSession && (
                  <span className="absolute top-0.5 right-1/4 w-2 h-2 rounded-full bg-[#008B8E] animate-ping" />
                )}

                {/* Icon Container with subtle neon teal glow on active */}
                <div
                  className={`transition-all duration-200 ${
                    isActive
                      ? 'text-[#008B8E] scale-105'
                      : 'text-[#475569] group-hover:text-[#0F172A]'
                  }`}
                  style={
                    isActive
                      ? {
                          filter:
                            'drop-shadow(0 0 5px rgba(0, 139, 142, 0.5)) drop-shadow(0 0 8px rgba(0, 139, 142, 0.25))',
                        }
                      : undefined
                  }
                >
                  {item.icon(isActive)}
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] font-semibold tracking-tight mt-0.5 transition-all duration-200 ${
                    isActive
                      ? 'text-[#008B8E] font-bold'
                      : 'text-[#475569] group-hover:text-[#0F172A]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Pure Electric Teal Neon Tube Under-Light Highlight */}
                {isActive && (
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    {/* Neon Tube */}
                    <div
                      className="w-8 h-[2.5px] rounded-full bg-[#008B8E]"
                      style={{
                        boxShadow:
                          '0 0 5px #008B8E, 0 0 10px #008B8E, 0 0 14px rgba(0, 139, 142, 0.7)',
                      }}
                    />
                    {/* Diffused Glow */}
                    <div className="w-10 h-2 bg-[#008B8E]/30 blur-[5px] rounded-full -mt-0.5 pointer-events-none" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
