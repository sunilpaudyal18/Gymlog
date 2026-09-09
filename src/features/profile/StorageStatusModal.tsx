import React, { useState, useEffect } from 'react';
import { Database, HardDrive, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { getDatabaseStatus } from '../../services/database/db';
import { useHistoryStore } from '../../stores/useHistoryStore';
import { useRoutineStore } from '../../stores/useRoutineStore';
import { useExerciseStore } from '../../stores/useExerciseStore';

export interface StorageStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StorageStatusModal: React.FC<StorageStatusModalProps> = ({ isOpen, onClose }) => {
  const [dbStatus, setDbStatus] = useState<string>('ready');
  const completedWorkouts = useHistoryStore((s) => s.completedSessions.length);
  const userRoutines = useRoutineStore((s) => s.routines.length);
  const customExercises = useExerciseStore((s) => s.exercises.filter((e) => e.isCustom).length);

  useEffect(() => {
    setDbStatus(getDatabaseStatus());
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Local Storage Status" type="sheet">
      <div className="space-y-4 select-none">
        <p className="text-xs text-[#475569]">
          Gym Log operates 100% locally on your device. Your data is privately stored in IndexedDB and never uploaded to any remote server or cloud.
        </p>

        {/* 1. Primary Storage Engine */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={16} className="text-[#008B8E]" />
              <h4 className="text-sm font-bold text-[#0F172A]">IndexedDB Engine</h4>
            </div>
            <span className="bg-[#008B8E]/10 text-[#008B8E] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#008B8E]/30">
              {dbStatus.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Durable on-device database (<code className="text-[#008B8E] font-mono text-[11px]">gym_offline_db</code>). Survives browser reloads, cache updates, and restarts.
          </p>
        </div>

        {/* 2. Zero-Cloud Privacy Model */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#008B8E]" />
              <h4 className="text-sm font-bold text-[#0F172A]">Zero-Cloud Privacy</h4>
            </div>
            <span className="bg-[#008B8E]/10 text-[#008B8E] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#008B8E]/30">
              100% PRIVATE
            </span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            No remote accounts, no cloud databases, and no external telemetry. Full workout logs stay strictly on your device.
          </p>
        </div>

        {/* 3. Stored Data Overview */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <HardDrive size={16} className="text-[#008B8E]" />
            <h4 className="text-sm font-bold text-[#0F172A]">Durable Records Stored</h4>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Routines</span>
              <span className="text-base font-bold text-[#0F172A]">{userRoutines}</span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Workouts</span>
              <span className="text-base font-bold text-[#0F172A]">{completedWorkouts}</span>
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2.5 text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase block">Custom Ex.</span>
              <span className="text-base font-bold text-[#0F172A]">{customExercises}</span>
            </div>
          </div>
        </div>

        {/* 4. Full Offline Freedom */}
        <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl flex items-center gap-2.5 text-xs font-medium text-[#0F172A]">
          <CheckCircle2 size={18} className="text-[#10B981] shrink-0" />
          <span>Works seamlessly completely offline with zero internet connectivity required.</span>
        </div>
      </div>
    </Modal>
  );
};

export default StorageStatusModal;
