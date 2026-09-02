import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 rounded-lg cursor-pointer tracking-wide select-none';

  const variants = {
    primary: 'bg-[#008B8E] text-white hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-md hover:shadow-lg',
    secondary: 'bg-white text-[#0F172A] hover:bg-[#F1F5F9] active:bg-[#E2E8F0] border border-[#CBD5E1] shadow-sm',
    ghost: 'bg-transparent text-[#475569] hover:bg-white/80 active:bg-[#E2E8F0] hover:text-[#0F172A]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-sm',
    outline: 'bg-transparent text-[#008B8E] border border-[#008B8E] hover:bg-[#008B8E]/10 active:bg-[#008B8E]/20',
  };

  const sizes = {
    sm: 'h-9 px-3 text-xs rounded-md gap-1.5',
    md: 'h-11 px-4 text-sm rounded-lg gap-2',
    lg: 'h-13 px-6 text-base rounded-xl gap-2.5',
    hero: 'h-14 px-6 text-base font-extrabold rounded-xl gap-2',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
