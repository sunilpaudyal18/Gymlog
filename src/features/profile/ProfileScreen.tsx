import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Dumbbell,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronRight,
  Cloud,
  Edit2,
  Timer,
  Volume2,
  Camera,
  Trash2,
  Flame,
} from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import {
  calculateOverallStats,
  calculateWeeklyConsistency,
  calculatePersonalRecords,
} from '../../utils/analyticsCalc';
import { compressProfileImage } from '../../utils/imageCompressor';
import { SyncStatusModal } from './SyncStatusModal';
import { TrainingUnitsModal } from './TrainingUnitsModal';
import { TimerSettingsModal } from './TimerSettingsModal';
import { SoundVibrationModal } from './SoundVibrationModal';
import { ProgressModal } from './ProgressModal';
import { HelpKnowledgeBaseModal } from './HelpKnowledgeBaseModal';
import { Modal } from '../../components/ui/Modal';

export const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profile, updateProfile, preferences } = useUserStore();
  const { completedSessions } = useHistoryStore();

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [editName, setEditName] = useState(profile.name);
  const [editGoal, setEditGoal] = useState(profile.goal);
  const [editAvatarUrl, setEditAvatarUrl] = useState(profile.avatarUrl || '');
  const [isCompressing, setIsCompressing] = useState(false);

  const stats = calculateOverallStats(completedSessions);
  const weeklyDays = calculateWeeklyConsistency(completedSessions);
  const personalRecords = calculatePersonalRecords(completedSessions);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressProfileImage(file, 300, 0.85);
      setEditAvatarUrl(compressedDataUrl);
      updateProfile({ avatarUrl: compressedDataUrl });
    } catch (err) {
      console.error('Error compressing profile image:', err);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || 'Alex Johnson',
      goal: editGoal,
      avatarUrl: editAvatarUrl || undefined,
    });
    setShowEditModal(false);
  };

  // Systematic modular preference categories
  const menuItems = [
    {
      id: 'training',
      label: 'Training & Units',
      subtitle: `Weight unit: ${preferences.weightUnit.toUpperCase()} • Barbell & plate jumps`,
      icon: Dumbbell,
      color: 'text-[#008B8E]',
      onClick: () => setShowTrainingModal(true),
    },
    {
      id: 'timer',
      label: 'Timer & Rest Settings',
      subtitle: `Default: ${preferences.defaultRestSeconds}s • Auto-start: ${preferences.autoStartRest ? 'ON' : 'OFF'}`,
      icon: Timer,
      color: 'text-[#008B8E]',
      onClick: () => setShowTimerModal(true),
    },
    {
      id: 'sound',
      label: 'Sound & Vibration',
      subtitle: `Audio chimes: ${preferences.soundEnabled ? 'ON' : 'OFF'} • Haptics: ${preferences.vibrationEnabled ? 'ON' : 'OFF'}`,
      icon: Volume2,
      color: 'text-[#008B8E]',
      onClick: () => setShowSoundModal(true),
    },
    {
      id: 'sync',
      label: 'Sync & Cloud Status',
      subtitle: 'Real-time database backup & offline sync',
      icon: Cloud,
      color: 'text-[#008B8E]',
      onClick: () => setShowSyncModal(true),
    },
    {
      id: 'settings',
      label: 'All Settings & Preferences',
      subtitle: 'Comprehensive app management and account settings',
      icon: SettingsIcon,
      color: 'text-[#008B8E]',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        navigate('/settings');
      },
    },
    {
      id: 'help',
      label: 'Help & Knowledge Base',
      subtitle: 'Workout logging principles, offline FAQs & guidance',
      icon: HelpCircle,
      color: 'text-[#008B8E]',
      onClick: () => setShowHelpModal(true),
    },
  ];

  return (
    <div className="flex flex-col px-4 pt-3 pb-24 space-y-5 animate-fade-in max-w-md mx-auto select-none">
      {/* Hidden File Input for Profile Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* 1. Seamless Organic Profile Header (No box/border enclosure & Larger borderless Avatar) */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div className="flex items-center gap-4">
          {/* Avatar Container with Tap to Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer shrink-0"
            title="Tap to change profile picture"
          >
            <div className="w-20 h-20 rounded-3xl bg-white shadow-md overflow-hidden flex items-center justify-center font-bold text-2xl text-[#008B8E] relative transition-transform active:scale-95">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[#008B8E] font-bold">
                  {profile.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </span>
              )}

              {/* Hover/Tap Camera Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
            </div>

            {/* Micro Camera Badge */}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[#008B8E] text-white flex items-center justify-center border-2 border-white shadow-xs">
              <Camera size={13} className="stroke-[2.5]" />
            </div>
          </div>

          {/* Attached Bio Typography */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none truncate">
                {profile.name}
              </h1>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#008B8E] bg-[#008B8E]/10 px-2.5 py-0.5 rounded-md border border-[#008B8E]/20">
                {profile.goal}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Action Button */}
        <button
          type="button"
          onClick={() => {
            setEditName(profile.name);
            setEditGoal(profile.goal);
            setEditAvatarUrl(profile.avatarUrl || '');
            setShowEditModal(true);
          }}
          className="w-9 h-9 rounded-full bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center shadow-sm hover:bg-[#F1F5F9] transition-all cursor-pointer active:scale-95 shrink-0"
          aria-label="Edit Profile"
          title="Edit Profile"
        >
          <Edit2 size={16} />
        </button>
      </div>

      {/* 2. Interactive Progress Summary Card (Opens Progress Modal) */}
      <div
        onClick={() => setShowProgressModal(true)}
        className="bg-white/80 border border-[#CBD5E1] hover:border-[#008B8E] rounded-3xl p-5 shadow-sm space-y-4 cursor-pointer transition-all duration-200 group relative backdrop-blur-md"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#008B8E]/10 text-[#008B8E] flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] tracking-tight group-hover:text-[#008B8E] transition-colors">
                Progress & Performance
              </h3>
              <p className="text-[11px] text-[#475569]">Tap for comprehensive deep-dive</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-[#94A3B8] group-hover:text-[#008B8E] group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">
              WORKOUTS
            </span>
            <span className="font-mono-metric font-bold text-lg text-[#0F172A]">
              {stats.totalWorkouts}
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-[#475569] uppercase block tracking-wider">
              VOLUME
            </span>
            <span className="font-mono-metric font-bold text-lg text-[#0F172A]">
              {stats.totalVolumeKg > 1000
                ? `${(stats.totalVolumeKg / 1000).toFixed(1)}k`
                : stats.totalVolumeKg}
              <span className="text-xs font-normal text-[#64748B] ml-0.5">kg</span>
            </span>
          </div>

          <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-2.5 text-center">
            <span className="text-[10px] font-bold text-[#D96B27] uppercase block tracking-wider flex items-center justify-center gap-0.5">
              <Flame size={11} className="fill-[#D96B27]" />
              <span>THIS WEEK</span>
            </span>
            <span className="font-mono-metric font-bold text-lg text-[#D96B27]">
              {stats.thisWeekCount}
              <span className="text-xs font-normal text-[#D96B27]/70 ml-0.5">days</span>
            </span>
          </div>
        </div>

        {/* Mini Consistency Strip */}
        <div className="flex items-center justify-between pt-1 border-t border-[#CBD5E1]/60">
          <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
            This Week's Activity
          </span>
          <div className="flex items-center gap-1.5">
            {weeklyDays.map((d, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono-metric transition-all ${
                  d.hasWorkout
                    ? 'bg-[#008B8E] text-white shadow-xs'
                    : 'bg-[#F1F5F9] text-[#94A3B8] border border-[#CBD5E1]'
                }`}
                title={`${d.dayName}: ${d.hasWorkout ? 'Workout completed' : 'Rest day'}`}
              >
                {d.short[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Systematic Settings & Preferences Menu */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1">
          Settings & Preferences
        </span>

        <div className="bg-white/80 border border-[#CBD5E1] rounded-3xl overflow-hidden divide-y divide-[#E2E8F0] shadow-sm backdrop-blur-md">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="w-full p-4 flex items-center justify-between hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#008B8E]/10 border border-[#008B8E]/20 text-[#008B8E] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-[#0F172A] tracking-tight group-hover:text-[#008B8E] transition-colors truncate">
                      {item.label}
                    </h4>
                    <p className="text-xs text-[#475569] font-medium truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-[#94A3B8] group-hover:text-[#0F172A] group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* MODALS */}

      {/* Progress Detail Modal */}
      {showProgressModal && (
        <ProgressModal
          isOpen={showProgressModal}
          onClose={() => setShowProgressModal(false)}
        />
      )}

      {/* Training & Units Modal */}
      {showTrainingModal && (
        <TrainingUnitsModal
          isOpen={showTrainingModal}
          onClose={() => setShowTrainingModal(false)}
        />
      )}

      {/* Timer Settings Modal */}
      {showTimerModal && (
        <TimerSettingsModal
          isOpen={showTimerModal}
          onClose={() => setShowTimerModal(false)}
        />
      )}

      {/* Sound & Vibration Modal */}
      {showSoundModal && (
        <SoundVibrationModal
          isOpen={showSoundModal}
          onClose={() => setShowSoundModal(false)}
        />
      )}

      {/* Sync Status Modal */}
      {showSyncModal && (
        <SyncStatusModal
          isOpen={showSyncModal}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {/* Help & Knowledge Base Modal */}
      {showHelpModal && (
        <HelpKnowledgeBaseModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Profile"
          type="sheet"
        >
          <div className="space-y-4 select-none pt-1">
            {/* Profile Avatar Picker */}
            <div className="flex items-center gap-4 p-3 bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-[#008B8E]/10 overflow-hidden flex items-center justify-center font-bold text-lg text-[#008B8E] shrink-0 shadow-sm">
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span>
                    {editName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'AJ'}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white border border-[#CBD5E1] hover:border-[#008B8E] px-3 py-1.5 rounded-lg text-xs font-bold text-[#0F172A] hover:text-[#008B8E] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Camera size={13} />
                  <span>{isCompressing ? 'Compressing...' : 'Upload New Photo'}</span>
                </button>
                {editAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditAvatarUrl('');
                      updateProfile({ avatarUrl: undefined });
                    }}
                    className="text-[#EF4444] text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={12} />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-white border border-[#CBD5E1] rounded-xl px-4 py-3 text-[#0F172A] text-sm focus:outline-none focus:border-[#008B8E] shadow-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#475569] uppercase block mb-1">
                Fitness Goal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['MUSCLE GAIN', 'STRENGTH', 'FAT LOSS', 'ENDURANCE'].map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setEditGoal(goal)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      editGoal === goal
                        ? 'bg-[#008B8E]/10 text-[#008B8E] border-[#008B8E]'
                        : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                className="w-full bg-[#008B8E] text-white font-bold py-3.5 rounded-xl uppercase tracking-wider text-xs hover:bg-[#00A3A6] active:bg-[#007A7C] shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
