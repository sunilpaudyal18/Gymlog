import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'highlight' | 'active-glow';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  noPadding = false,
  ...props
}) => {
  const base = 'rounded-2xl transition-all border backdrop-blur-md';

  const variants = {
    default: 'bg-white/75 border-[#CBD5E1]/60 shadow-sm',
    elevated: 'bg-white/90 border-[#CBD5E1]/80 shadow-md',
    highlight: 'bg-white/85 border-[#CBD5E1]/70 shadow-sm',
    'active-glow': 'bg-white/85 border-[#008B8E] shadow-[0_0_20px_rgba(0,139,142,0.15)]',
  };

  return (
    <div
      className={twMerge(
        clsx(base, variants[variant], !noPadding && 'p-4 sm:p-5', className)
      )}
      {...props}
    >
      {children}
    </div>
  );
};
