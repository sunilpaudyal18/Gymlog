import React from 'react';
import { Timer, Zap, Play, Check } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useUserStore } from '../../stores/useUserStore';

export interface TimerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { preferences, setDefaultRestSeconds, toggleAutoStartRest } = useUserStore();

  const restOptions = [
    { sec: 60, label: '60s', sub: 'Light / Accessories' },
    { sec: 90, label: '90s', sub: 'Hypertrophy Standard' },
    { sec: 120, label: '120s', sub: 'Compound Standard' },
    { sec: 180, label: '180s', sub: 'Heavy Strength / Power' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timer & Rest Settings" type="sheet">
      <div className="space-y-5 select-none pt-1">
        {/* 1. Default Rest Interval Presets */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Timer size={16} className="text-[#008B8E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              Default Rest Interval
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {restOptions.map((opt) => {
              const isSelected = preferences.defaultRestSeconds === opt.sec;
              return (
                <button
                  key={opt.sec}
                  type="button"
                  onClick={() => setDefaultRestSeconds(opt.sec)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#008B8E]/10 border-[#008B8E] text-[#008B8E]'
                      : 'bg-white border-[#CBD5E1] text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono-metric font-bold text-lg">
                      {opt.label}
                    </span>
                    {isSelected && <Check size={16} className="text-[#008B8E] stroke-[3]" />}
                  </div>
                  <span className="text-[10px] text-[#64748B] font-medium mt-1">
                    {opt.sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Auto-Start Rest on Completed Set */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#008B8E]" />
                <span className="text-sm font-bold text-[#0F172A]">
                  Auto-Start Rest Timer
                </span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed">
                Automatically start the rest countdown modal when checking off a set.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleAutoStartRest}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.autoStartRest ? 'bg-[#008B8E]' : 'bg-[#CBD5E1]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.autoStartRest ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Quick Stepper Buttons Note */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-3.5 flex items-center gap-3">
          <Play size={18} className="text-[#008B8E] shrink-0" />
          <p className="text-xs text-[#475569]">
            During workouts, you can always adjust remaining rest with <span className="font-bold text-[#0F172A]">+15s</span>, <span className="font-bold text-[#0F172A]">-15s</span>, or <span className="font-bold text-[#0F172A]">+30 SEC</span> buttons.
          </p>
        </div>

        {/* Done Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#008B8E] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-[#00A3A6] shadow-sm"
          >
            Done & Save Settings
          </button>
        </div>
      </div>
    </Modal>
  );
};
