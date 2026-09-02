import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Dumbbell, TrendingUp, History } from 'lucide-react';

export const QuickAccessGrid: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const items = [
    {
      id: 'routines',
      label: 'My Routines',
      icon: Folder,
      path: '/workouts',
    },
    {
      id: 'exercises',
      label: 'Exercises',
      icon: Dumbbell,
      path: '/exercises',
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: TrendingUp,
      path: '/progress',
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      path: '/history',
    },
  ];

  return (
    <div className="space-y-3 select-none">
      {/* 1. Section Header */}
      <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
        Quick Access
      </h3>

      {/* 2. Glass Grid 4-Column Structure */}
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isHovered = hoveredId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative rounded-[16px] px-1.5 py-3 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group h-24 select-none overflow-hidden active:scale-95 shadow-sm"
              style={{
                background: isHovered
                  ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.85) 50%, rgba(241, 245, 249, 0.98) 100%)'
                  : 'linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(248, 250, 252, 0.7) 50%, rgba(241, 245, 249, 0.88) 100%)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: isHovered ? '1px solid rgba(0, 139, 142, 0.6)' : '1px solid rgba(203, 213, 225, 0.6)',
                boxShadow: isHovered
                  ? '0 6px 18px -2px rgba(15, 23, 42, 0.08), 0 0 12px rgba(0, 139, 142, 0.15), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)'
                  : '0 4px 12px -2px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.8)',
              }}
              aria-label={item.label}
            >
              {/* Micro light-streak glare across top-right corner */}
              <div className="absolute inset-0 bg-[linear-gradient(225deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.05)_32%,transparent_60%)] pointer-events-none" />

              {/* Specular linear top highlight edge */}
              <div className="absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none" />

              {/* 3. Micro Glowing Icon Container */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-all duration-200 relative shrink-0 border"
                style={{
                  background: isHovered
                    ? 'rgba(0, 139, 142, 0.15)'
                    : 'rgba(0, 139, 142, 0.08)',
                  borderColor: isHovered
                    ? 'rgba(0, 139, 142, 0.35)'
                    : 'rgba(0, 139, 142, 0.18)',
                  boxShadow: isHovered
                    ? '0 2px 8px rgba(0, 139, 142, 0.25)'
                    : '0 2px 6px rgba(0, 139, 142, 0.12)',
                }}
              >
                <Icon
                  size={18}
                  className="stroke-[2.2] transition-transform duration-200 group-hover:scale-110 text-[#008B8E]"
                />
              </div>

              {/* Tile Label */}
              <span className="text-[11px] font-semibold text-[#0F172A] tracking-[-0.01em] text-center w-full leading-tight group-hover:text-[#008B8E] transition-colors">
                {item.label}
              </span>

              {/* 4. Active / Hover bottom neon glow line */}
              {isHovered && (
                <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                  <div
                    className="w-8 h-[2px] rounded-full bg-[#008B8E]"
                    style={{
                      boxShadow:
                        '0 0 6px #008B8E, 0 0 8px rgba(0, 139, 142, 0.6)',
                    }}
                  />
                  <div className="w-10 h-2 bg-[#008B8E]/20 blur-[3px] rounded-full -mt-0.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
