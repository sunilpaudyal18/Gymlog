import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  type?: 'sheet' | 'center' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  type = 'sheet',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center select-none">
      {/* Dimmed Blurred Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Structured Modal Container (Flex Column with independent scrollable body) */}
      <div
        className={`relative z-10 w-full max-w-md bg-white border border-[#CBD5E1] shadow-2xl flex flex-col transition-all duration-300 animate-slide-up ${
          type === 'sheet'
            ? 'rounded-t-3xl max-h-[88vh] sm:rounded-2xl sm:max-h-[85vh] sm:mx-4'
            : type === 'fullscreen'
            ? 'h-full max-h-screen rounded-none'
            : 'rounded-2xl max-h-[85vh] mx-4'
        }`}
        style={{
          boxShadow: '0 -8px 30px rgba(15, 23, 42, 0.15), 0 20px 40px rgba(15, 23, 42, 0.2)',
        }}
      >
        {/* Header - Fixed at Top of Modal */}
        {(title || showCloseButton) && (
          <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#CBD5E1] bg-white rounded-t-3xl sm:rounded-t-2xl relative">
            {type === 'sheet' && (
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-[#CBD5E1] rounded-full" />
            )}
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">{title}</h3>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F1F5F9] border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition-colors cursor-pointer shadow-sm active:scale-95"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 pb-8 space-y-4 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );
};
