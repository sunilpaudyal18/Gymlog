import React from 'react';
import { Volume2, Smartphone, BellRing, Sparkles } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useUserStore } from '../../stores/useUserStore';

export interface SoundVibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundVibrationModal: React.FC<SoundVibrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    preferences,
    toggleSound,
    toggleVibration,
    toggleNotifications,
  } = useUserStore();

  const handleTestChime = () => {
    try {
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
      if ('vibrate' in navigator && preferences.vibrationEnabled) {
        navigator.vibrate([100, 50, 100]);
      }
    } catch {
      // Audio preview fallback
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sound & Vibration" type="sheet">
      <div className="space-y-4 select-none pt-1">
        {/* 1. Audio Sound Effects Toggle */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#008B8E]/10 flex items-center justify-center text-[#008B8E] shrink-0">
                <Volume2 size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">
                  Audio Sound Effects
                </span>
                <span className="text-xs text-[#475569]">
                  3-2-1 rest countdown beeps & set completion bell
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.soundEnabled ? 'bg-[#008B8E]' : 'bg-[#CBD5E1]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.soundEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Haptic Vibration Toggle */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#008B8E]/10 flex items-center justify-center text-[#008B8E] shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">
                  Haptic Feedback
                </span>
                <span className="text-xs text-[#475569]">
                  Tactile vibration feedback on completed set and rest end
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleVibration}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.vibrationEnabled ? 'bg-[#008B8E]' : 'bg-[#CBD5E1]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.vibrationEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Workout Reminder Push Notifications */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#008B8E]/10 flex items-center justify-center text-[#008B8E] shrink-0">
                <BellRing size={20} />
              </div>
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">
                  Training Reminders
                </span>
                <span className="text-xs text-[#475569]">
                  Gentle scheduled notifications for routine consistency
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleNotifications}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                preferences.notificationsEnabled ? 'bg-[#008B8E]' : 'bg-[#CBD5E1]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  preferences.notificationsEnabled ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Test Chime / Preview Audio */}
        <button
          type="button"
          onClick={handleTestChime}
          className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#CBD5E1] text-[#0F172A] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm"
        >
          <Sparkles size={14} className="text-[#008B8E]" />
          <span>Test Audio Chime & Vibration</span>
        </button>

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
