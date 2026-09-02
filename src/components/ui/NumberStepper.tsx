import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface NumberStepperProps {
  value: number;
  onChange: (newValue: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  unit?: string;
  className?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  label,
  unit,
  className = '',
}) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value - step >= min) {
      onChange(Math.max(min, Number((value - step).toFixed(2))));
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value + step <= max) {
      onChange(Math.min(max, Number((value + step).toFixed(2))));
    }
  };

  return (
    <div className={`flex items-center justify-between bg-white border border-[#CBD5E1] rounded-xl px-2 py-1.5 shadow-sm select-none ${className}`}>
      {label && <span className="text-xs font-semibold text-[#475569] pl-2">{label}</span>}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="w-8 h-8 rounded-lg bg-[#F1F5F9] text-[#0F172A] hover:bg-[#E2E8F0] active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer border border-[#CBD5E1]"
        >
          <Minus size={14} className="stroke-[2.5]" />
        </button>

        <span className="min-w-[40px] text-center font-mono-metric font-bold text-base text-[#0F172A]">
          {value}
          {unit && <span className="text-xs text-[#475569] ml-1 font-normal">{unit}</span>}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="w-8 h-8 rounded-lg bg-[#008B8E] text-white hover:bg-[#00A3A6] active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer shadow-sm"
        >
          <Plus size={14} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
