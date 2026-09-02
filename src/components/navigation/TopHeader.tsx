import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical } from 'lucide-react';

export interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  activeSessionTag?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  activeSessionTag = false,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#F4F6F9]/90 backdrop-blur-md px-4 py-3 flex items-center justify-between min-h-[56px] border-b border-[#CBD5E1]/70 select-none">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          {activeSessionTag && (
            <span className="text-[10px] font-bold text-[#008B8E] tracking-widest uppercase block">
              Active Session
            </span>
          )}
          {title && <h1 className="text-xl font-bold text-[#0F172A] tracking-tight uppercase">{title}</h1>}
          {subtitle && <p className="text-xs text-[#475569] mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {rightAction || (
          <button
            type="button"
            className="w-8 h-8 rounded-full text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors"
          >
            <MoreVertical size={18} />
          </button>
        )}
      </div>
    </header>
  );
};
