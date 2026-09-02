import React, { useState } from 'react';
import { Dumbbell, Check, Scale, Layers } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useUserStore } from '../../stores/useUserStore';

export interface TrainingUnitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrainingUnitsModal: React.FC<TrainingUnitsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { preferences, setWeightUnit } = useUserStore();
  const [barbellWeight, setBarbellWeight] = useState(20);
  const [plateIncrement, setPlateIncrement] = useState(2.5);

  const isKg = preferences.weightUnit === 'kg';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Training & Units" type="sheet">
      <div className="space-y-5 select-none pt-1">
        {/* 1. Weight Unit Toggle */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Scale size={16} className="text-[#008B8E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Weight Measurement Unit
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-[#F1F5F9] p-1.5 rounded-2xl border border-[#CBD5E1]">
            <button
              type="button"
              onClick={() => setWeightUnit('kg')}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isKg
                  ? 'bg-[#008B8E] text-white shadow-sm'
                  : 'bg-transparent text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {isKg && <Check size={14} className="stroke-[3]" />}
              <span>Kilograms (KG)</span>
            </button>

            <button
              type="button"
              onClick={() => setWeightUnit('lb')}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                !isKg
                  ? 'bg-[#008B8E] text-white shadow-sm'
                  : 'bg-transparent text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {!isKg && <Check size={14} className="stroke-[3]" />}
              <span>Pounds (LB)</span>
            </button>
          </div>
        </div>

        {/* 2. Standard Olympic Barbell Weight */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Dumbbell size={16} className="text-[#008B8E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Standard Barbell Base Weight
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 20, label: isKg ? '20 kg' : '45 lb', sub: 'Olympic Standard' },
              { val: 15, label: isKg ? '15 kg' : '33 lb', sub: 'Women / Tech' },
              { val: 10, label: isKg ? '10 kg' : '22 lb', sub: 'Short Bar' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setBarbellWeight(item.val)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  barbellWeight === item.val
                    ? 'bg-[#008B8E]/10 border-[#008B8E] text-[#008B8E]'
                    : 'bg-white border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <span className="font-mono-metric font-bold text-sm block">
                  {item.label}
                </span>
                <span className="text-[10px] text-[#64748B] block mt-0.5">
                  {item.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Minimum Plate Jump */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#008B8E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Micro-Loading Step Increment
            </h4>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { val: 1.25, label: isKg ? '1.25 kg' : '2.5 lb' },
              { val: 2.5, label: isKg ? '2.5 kg' : '5 lb' },
              { val: 5.0, label: isKg ? '5.0 kg' : '10 lb' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setPlateIncrement(item.val)}
                className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer font-mono-metric font-bold text-xs ${
                  plateIncrement === item.val
                    ? 'bg-[#008B8E] text-white border-[#008B8E] shadow-sm'
                    : 'bg-white border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                + {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#008B8E] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-[#00A3A6] shadow-sm"
          >
            Done & Save Preferences
          </button>
        </div>
      </div>
    </Modal>
  );
};
