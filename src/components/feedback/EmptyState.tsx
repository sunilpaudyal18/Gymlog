import React from 'react';
import { Button } from '../ui/Button';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 animate-fade-in select-none">
      <div className="w-24 h-24 rounded-full bg-white border border-[#CBD5E1] flex items-center justify-center text-[#475569] mb-6 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#0F172A] mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-[#475569] max-w-xs mb-8 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="hero"
          className="w-full max-w-xs uppercase tracking-wider"
        >
          + {actionLabel}
        </Button>
      )}
    </div>
  );
};
