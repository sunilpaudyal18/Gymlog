import React, { useState, useEffect } from 'react';
import { KineticGBarbellMark } from './Logo';

export interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 2400,
}) => {
  const [mounted, setMounted] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [statusText, setStatusText] = useState("If we don’t fight, we can’t win");

  useEffect(() => {
    // Dynamic sequence of telemetry status updates
    const t1 = setTimeout(() => {
      setStatusText("I'M NOT GOING TO LOSE");
    }, 650);

    const t2 = setTimeout(() => {
      setStatusText("KEEP YOUR HEART BURNING");
    }, 1250);

    const t3 = setTimeout(() => {
      setStatusText("GO BEYOND. PLUS ULTRA");
    }, 1700);

    // Trigger smooth fade-out exit transition
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, minDurationMs);

    // Completely unmount from DOM after the 400ms fade transition
    const unmountTimer = setTimeout(() => {
      setMounted(false);
      onComplete?.();
      try {
        sessionStorage.setItem('app_booted', 'true');
      } catch {
        // Fallback for restricted storage environments
      }
    }, minDurationMs + 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(exitTimer);
      clearTimeout(unmountTimer);
    };
  }, [minDurationMs, onComplete]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0F172A] select-none pointer-events-auto transition-opacity duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        willChange: 'opacity',
      }}
      aria-hidden={isExiting}
    >
      {/* Background Soft Ambient Light Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        {/* Electric Volt Ambient Glow */}
        <div
          className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-[#B4FF39] blur-[56px] animate-kinetic-glow pointer-events-none"
          style={{ opacity: 0.18 }}
        />
        {/* Performance Teal Radial Under-layer */}
        <div
          className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-[#008B8E] blur-[72px] pointer-events-none"
          style={{ opacity: 0.14 }}
        />
      </div>

      {/* Kinetic Logo Core with Vertical Float */}
      <div className="relative flex flex-col items-center justify-center animate-kinetic-float z-10">
        <KineticGBarbellMark className="h-20 sm:h-24 w-auto drop-shadow-[0_10px_28px_rgba(0,139,142,0.4)]" />

        {/* GYM Typography (Inter 900 with wide letter spacing) */}
        <div className="flex items-center leading-none mt-6">
          <span className="font-sans font-black tracking-[0.28em] text-3xl sm:text-4xl text-white ml-2">
            GYM
          </span>
          <span
            className="w-2.5 h-2.5 rounded-full bg-[#B4FF39] ml-2 translate-y-1 shadow-[0_0_12px_#B4FF39]"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* High-Performance Energy Line & Telemetry Status */}
      <div className="mt-8 flex flex-col items-center gap-3 z-10">
        {/* Linear Energy Track */}
        <div className="w-48 sm:w-56 h-1 bg-[#1E293B] rounded-full overflow-hidden relative border border-slate-700/50">
          {/* Traveling Electric Volt Streak */}
          <div
            className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-[#B4FF39] to-[#008B8E] rounded-full animate-energy-streak"
            style={{
              boxShadow: '0 0 12px #B4FF39, 0 0 20px rgba(180, 255, 57, 0.4)',
            }}
          />
        </div>

        {/* Metric Loading Status in JetBrains Mono */}
        <span className="font-mono-metric text-[10.5px] text-slate-400 tracking-[0.22em] uppercase transition-colors duration-300">
          {statusText}
        </span>
      </div>

      {/* Subtle Engine Version Tag at bottom */}
      <div className="absolute bottom-7 font-mono-metric text-[10px] text-slate-500/80 tracking-[0.25em] uppercase pointer-events-none">
        Build By Sunil Paudyal
      </div>
    </div>
  );
};
