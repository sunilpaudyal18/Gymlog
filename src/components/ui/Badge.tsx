import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'volt' | 'active' | 'success' | 'warning' | 'error' | 'muted' | 'outline' | 'teal' | 'amber';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'teal',
  size = 'sm',
  className,
}) => {
  const base = 'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-md transition-colors select-none';

  const variants = {
    volt: 'bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30',
    teal: 'bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30',
    active: 'bg-[#008B8E]/12 text-[#008B8E] border border-[#008B8E]/30 font-bold tracking-widest',
    amber: 'bg-[#D96B27]/10 text-[#D96B27] border border-[#D96B27]/30',
    success: 'bg-[#008B8E]/10 text-[#008B8E] border border-[#008B8E]/30',
    warning: 'bg-[#D96B27]/10 text-[#D96B27] border border-[#D96B27]/30',
    error: 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30',
    muted: 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]',
    outline: 'border border-[#CBD5E1] text-[#475569]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={twMerge(clsx(base, variants[variant], sizes[size], className))}>
      {children}
    </span>
  );
};

export interface ChipProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  isSelected = false,
  onClick,
  icon,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all select-none cursor-pointer border',
          isSelected
            ? 'bg-[#008B8E] text-white border-[#008B8E] shadow-sm font-bold'
            : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]',
          className
        )
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
