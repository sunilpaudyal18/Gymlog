import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'volt-ghost' | 'teal-ghost';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  active = false,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center rounded-full transition-all duration-150 active:scale-90 disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none';

  const variants = {
    primary: 'bg-[#008B8E] text-white hover:bg-[#00A3A6] shadow-sm',
    secondary: 'bg-white text-[#0F172A] hover:bg-[#F1F5F9] border border-[#CBD5E1] shadow-sm',
    ghost: 'bg-transparent text-[#64748B] hover:text-[#0F172A] hover:bg-white/80',
    danger: 'bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 border border-[#EF4444]/30',
    'volt-ghost': 'bg-[#008B8E]/10 text-[#008B8E] hover:bg-[#008B8E]/20',
    'teal-ghost': 'bg-[#008B8E]/10 text-[#008B8E] hover:bg-[#008B8E]/20',
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  };

  return (
    <button
      className={twMerge(
        clsx(base, variants[variant], sizes[size], active && 'ring-2 ring-[#008B8E]', className)
      )}
      {...props}
    >
      {children}
    </button>
  );
};
