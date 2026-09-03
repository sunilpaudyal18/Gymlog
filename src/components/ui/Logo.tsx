import React from 'react';
import { KINETIC_G_BARBELL_PNG } from './kineticMarkData';

export interface LogoProps {
  /**
   * 'full': Kinetic G Barbell + GYM wordmark + accent dot (Desktop Sidebar standard)
   * 'compact': Kinetic G Barbell + GYM wordmark + accent dot (Mobile header standard, ~30px height)
   * 'mark': Standalone Kinetic G Barbell glyph
   */
  variant?: 'full' | 'compact' | 'mark';
  /**
   * 'light': Dark text for light quartz background (#0F172A)
   * 'dark': White text for AMOLED dark surfaces (#FFFFFF)
   * 'auto': Uses current text color inheritance
   */
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
  markClassName?: string;
  onClick?: () => void;
}

/**
 * 100% Exact Same-to-Same "Kinetic G Barbell" Mark
 * Renders the exact master asset from the approved design pack:
 * - Dynamic italicized chamfered 'G' with gradient transition from Performance Teal to Electric Volt
 * - Sharp kinetic aerodynamic fins and 3D inner bevel
 * - Integrated Olympic weight plates (left teal, right volt)
 */
export const KineticGBarbellMark: React.FC<{ className?: string }> = ({ className = 'h-8 w-auto' }) => {
  return (
    <img
      src={KINETIC_G_BARBELL_PNG}
      alt="Kinetic G Barbell"
      className={`shrink-0 transition-transform duration-300 select-none object-contain drop-shadow-[0_2px_8px_rgba(0,139,142,0.18)] ${className}`}
      draggable={false}
    />
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
  markClassName = '',
  onClick,
}) => {
  const textColor =
    theme === 'light'
      ? 'text-[#0F172A]'
      : theme === 'dark'
      ? 'text-white'
      : 'text-current';

  if (variant === 'mark') {
    return (
      <div
        className={`inline-flex items-center cursor-pointer ${className}`}
        onClick={onClick}
      >
        <KineticGBarbellMark className={markClassName || 'h-8 w-auto'} />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 cursor-pointer group select-none ${className}`}
        onClick={onClick}
      >
        <KineticGBarbellMark
          className={markClassName || 'h-7 w-auto group-hover:scale-105'}
        />
        <div className="flex items-center leading-none">
          <span
            className={`font-sans font-black tracking-tight text-xl ${textColor}`}
          >
            GYM
          </span>
          <span className="w-2 h-2 rounded-full bg-[#B4FF39] ml-1 shadow-[0_0_8px_#B4FF39] shrink-0 translate-y-0.5" />
        </div>
      </div>
    );
  }

  // variant === 'full' (Clean Horizontal Lockup: Logo Mark + GYM for Desktop Sidebar)
  return (
    <div
      className={`inline-flex items-center gap-2.5 cursor-pointer group select-none ${className}`}
      onClick={onClick}
    >
      <KineticGBarbellMark
        className={markClassName || 'h-8 lg:h-9 w-auto group-hover:scale-105 transition-transform duration-300'}
      />
      <div className="flex items-center leading-none">
        <span
          className={`font-sans font-black tracking-tight text-xl lg:text-2xl ${textColor}`}
        >
          GYM
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full bg-[#B4FF39] ml-1 shadow-[0_0_8px_#B4FF39] shrink-0 translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
