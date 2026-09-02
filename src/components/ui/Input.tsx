import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  unit?: string;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, unit, leftIcon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5 select-none">
        {label && (
          <label className="text-xs font-bold uppercase tracking-wider text-[#475569]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#64748B] flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-white/85 border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] text-sm transition-all focus:outline-none focus:border-[#008B8E] focus:ring-1 focus:ring-[#008B8E] shadow-sm',
                leftIcon && 'pl-10',
                unit && 'pr-12',
                error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]',
                className
              )
            )}
            {...props}
          />
          {unit && (
            <span className="absolute right-4 text-xs font-semibold text-[#64748B] pointer-events-none">
              {unit}
            </span>
          )}
        </div>
        {error && <span className="text-xs text-[#EF4444]">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
