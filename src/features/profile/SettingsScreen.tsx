import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  Timer,
  Volume2,
  Cloud,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Scale,
  Download,
  Upload,
  Database,
  CheckCircle2,
  FileJson,
  RotateCcw,
} from 'lucide-react';
import { useUserStore } from '../../stores/useUserStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { format } from 'date-fns';
import {
  exportBackupData,
  validateBackupData,
  applyBackupData,
  GymBackupPayload,
} from '../../utils/backupManager';

type SettingsCategory = 'all' | 'training' | 'timer' | 'audio' | 'data';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('category') as SettingsCategory) || 'all';

  const [activeTab, setActiveTab] = useState<SettingsCategory>(initialTab);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const {
    preferences,
    setWeightUnit,
    setDefaultRestSeconds,
    toggleAutoStartRest,
    toggleSound,
    toggleVibration,
    syncStatus,
    lastSyncedAt,
    triggerSync,
  } = useUserStore();

  const [showImportConfirmModal, setShowImportConfirmModal] = useState(false);
  const [pendingBackupPayload, setPendingBackupPayload] = useState<GymBackupPayload | null>(null);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    await triggerSync();
    setIsSyncing(false);
  };

  const handleExport = () => {
    exportBackupData();
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupData(content);

      if (!validation.isValid || !validation.data) {
        setImportError(validation.error || 'Invalid backup file');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setPendingBackupPayload(validation.data);
      setImportSummary(validation.summary);
      setShowImportConfirmModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (pendingBackupPayload) {
      applyBackupData(pendingBackupPayload);
      setShowImportConfirmModal(false);
      setPendingBackupPayload(null);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3500);
    }
  };

  const handleResetData = () => {
    useRoutineStore.getState().resetToDefaults();
    useHistoryStore.getState().resetToDefaults();
    setShowResetModal(false);
    navigate('/');
  };

  const restOptions = [
    { sec: 60, label: '60s' },
    { sec: 90, label: '90s' },
    { sec: 120, label: '120s' },
    { sec: 180, label: '180s' },
  ];

  const categoryTabs: { id: SettingsCategory; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'training', label: 'Training' },
    { id: 'timer', label: 'Timer' },
    { id: 'audio', label: 'Audio & Haptics' },
    { id: 'data', label: 'Data & Backup' },
  ];

  return (
    <div className="flex flex-col px-4 pt-4 pb-28 space-y-5 animate-fade-in max-w-md mx-auto select-none">
      {/* Hidden File Input for Backup Import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-white border border-[#CBD5E1] text-[#0F172A] flex items-center justify-center hover:bg-[#F1F5F9] transition-colors cursor-pointer shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>

        <h1 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
          SYSTEMATIC SETTINGS
        </h1>

        <div className="w-8" />
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#008B8E] text-white shadow-sm'
                : 'bg-white text-[#475569] border border-[#CBD5E1] hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. TRAINING & UNITS SECTION */}
      {(activeTab === 'all' || activeTab === 'training') && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1 flex items-center gap-1.5">
            <Scale size={14} className="text-[#008B8E]" />
            <span>TRAINING & UNITS</span>
          </span>

          <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-4 shadow-sm backdrop-blur-md">
            {/* Weight Unit Segmented Selector */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Weight Unit</span>
                <span className="text-[11px] text-[#475569]">
                  Metric (kg) or Imperial (lb) system
                </span>
              </div>

              <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#CBD5E1]">
                <button
                  type="button"
                  onClick={() => setWeightUnit('kg')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    preferences.weightUnit === 'kg'
                      ? 'bg-[#008B8E] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  KG
                </button>
                <button
                  type="button"
                  onClick={() => setWeightUnit('lb')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    preferences.weightUnit === 'lb'
                      ? 'bg-[#008B8E] text-white shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  LB
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TIMER & REST SECTION */}
      {(activeTab === 'all' || activeTab === 'timer') && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1 flex items-center gap-1.5">
            <Timer size={14} className="text-[#008B8E]" />
            <span>TIMER & REST INTERVALS</span>
          </span>

          <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Default Rest Duration</span>
                <span className="text-[11px] text-[#475569]">
                  Standard interval countdown
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {restOptions.map((opt) => (
                  <button
                    key={opt.sec}
                    type="button"
                    onClick={() => setDefaultRestSeconds(opt.sec)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono-metric font-bold border transition-all cursor-pointer ${
                      preferences.defaultRestSeconds === opt.sec
                        ? 'bg-[#008B8E]/10 text-[#008B8E] border-[#008B8E]'
                        : 'bg-[#F1F5F9] text-[#475569] border-[#CBD5E1] hover:text-[#0F172A]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#CBD5E1] pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Auto-Start Rest</span>
                <span className="text-[11px] text-[#475569]">
                  Automatically trigger timer on completed set
                </span>
              </div>

              <button
                type="button"
                onClick={toggleAutoStartRest}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
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
        </div>
      )}

      {/* 3. AUDIO & HAPTICS */}
      {(activeTab === 'all' || activeTab === 'audio') && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1 flex items-center gap-1.5">
            <Volume2 size={14} className="text-[#008B8E]" />
            <span>AUDIO & HAPTIC FEEDBACK</span>
          </span>

          <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-4 shadow-sm backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Sound Effects</span>
                <span className="text-[11px] text-[#475569]">
                  Countdown beeps and set completion chime
                </span>
              </div>

              <button
                type="button"
                onClick={toggleSound}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
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

            <div className="border-t border-[#CBD5E1] pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Haptic Vibrations</span>
                <span className="text-[11px] text-[#475569]">
                  Vibrate on timer completion
                </span>
              </div>

              <button
                type="button"
                onClick={toggleVibration}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
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
        </div>
      )}

      {/* 4. DATA, LOCAL STORAGE & BACKUP */}
      {(activeTab === 'all' || activeTab === 'data') && (
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#475569] px-1 flex items-center gap-1.5">
            <Database size={14} className="text-[#008B8E]" />
            <span>LOCAL DATA & BACKUP</span>
          </span>

          <div className="bg-white/80 border border-[#CBD5E1] rounded-2xl p-4 space-y-4 shadow-sm backdrop-blur-md">
            {/* Success Notifications */}
            {exportSuccess && (
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-center gap-2 text-xs font-bold text-[#10B981] animate-fade-in">
                <CheckCircle2 size={16} />
                <span>Backup JSON file generated and downloaded successfully.</span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-center gap-2 text-xs font-bold text-[#10B981] animate-fade-in">
                <CheckCircle2 size={16} />
                <span>Workout data restored successfully from backup file.</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl flex items-center gap-2 text-xs font-bold text-[#EF4444] animate-fade-in">
                <AlertTriangle size={16} />
                <span>{importError}</span>
              </div>
            )}

            {/* Export Action */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Export My Data</span>
                <span className="text-[11px] text-[#475569]">
                  Download complete workout routines, history & PRs as JSON
                </span>
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="px-3.5 py-2 rounded-xl bg-[#008B8E] hover:bg-[#00A3A6] active:bg-[#007A7C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>

            {/* Import Action */}
            <div className="border-t border-[#CBD5E1] pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Import Backup</span>
                <span className="text-[11px] text-[#475569]">
                  Restore workout logs from a gym-backup-*.json file
                </span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Upload size={14} />
                <span>Import</span>
              </button>
            </div>

            {/* Sync & Offline Status */}
            <div className="border-t border-[#CBD5E1] pt-3 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#0F172A] block">Offline Storage</span>
                <span className="text-[11px] text-[#475569]">
                  100% private local storage (IndexedDB / LocalStorage)
                </span>
              </div>

              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30">
                ACTIVE
              </span>
            </div>
          </div>

          {/* Reset All Data Card */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="w-full bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-[#EF4444]/30 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <RotateCcw size={15} />
              <span>RESET ALL WORKOUT DATA</span>
            </button>
          </div>
        </div>
      )}

      {/* Import Confirmation Modal */}
      {showImportConfirmModal && importSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#008B8E]">
              <FileJson size={22} />
              <h3 className="text-base font-bold text-[#0F172A]">Import Workout Backup?</h3>
            </div>

            <p className="text-xs text-[#475569] leading-relaxed">
              Importing this backup will replace your current local workout data with the contents of this file:
            </p>

            {/* Summary details */}
            <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Routines</span>
                <span className="font-bold text-[#0F172A]">{importSummary.routinesCount} items</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Workouts</span>
                <span className="font-bold text-[#0F172A]">{importSummary.sessionsCount} sessions</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Records (PRs)</span>
                <span className="font-bold text-[#0F172A]">{importSummary.prsCount} PRs</span>
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] uppercase block">Custom Exercises</span>
                <span className="font-bold text-[#0F172A]">{importSummary.customExercisesCount} custom</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportConfirmModal(false);
                  setPendingBackupPayload(null);
                }}
                className="bg-[#F1F5F9] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A] font-bold py-2.5 px-3 rounded-xl text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                className="bg-[#008B8E] text-white font-bold py-2.5 px-3 rounded-xl text-xs uppercase hover:bg-[#00A3A6] cursor-pointer"
              >
                Import Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#EF4444]">
              <AlertTriangle size={20} />
              <h3 className="text-base font-bold text-[#0F172A]">Reset All Data?</h3>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              This will restore the factory workout routines and reset your history to initial preset state. You can export a backup first to avoid losing data.
            </p>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="bg-[#F1F5F9] border border-[#CBD5E1] hover:bg-[#E2E8F0] text-[#0F172A] font-bold py-2.5 px-3 rounded-xl text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="bg-[#EF4444] text-white font-bold py-2.5 px-3 rounded-xl text-xs uppercase hover:bg-[#DC2626] cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

