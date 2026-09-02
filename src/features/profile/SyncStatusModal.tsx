import React from 'react';
import { RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { useSyncStore } from '../../stores/useSyncStore';

export interface SyncStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({ isOpen, onClose }) => {
  const { status, triggerSync } = useSyncStore();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync & Cloud Status" type="sheet">
      <div className="space-y-4 select-none">
        <p className="text-xs text-[#475569]">
          Demonstrating the available connection states & real-time sync engine
        </p>

        {/* 1. Connected (ONLINE) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#008B8E] animate-pulse" />
              <h4 className="text-sm font-bold text-[#0F172A]">Connected</h4>
            </div>
            <span className="bg-[#008B8E]/10 text-[#008B8E] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#008B8E]/30">
              ONLINE
            </span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Continuous real-time synchronization with cloud backup active.
          </p>
        </div>

        {/* 2. Syncing (PENDING) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCw size={14} className="text-[#D96B27] animate-spin" />
              <h4 className="text-sm font-bold text-[#0F172A]">Syncing...</h4>
            </div>
            <span className="bg-[#D96B27]/10 text-[#D96B27] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#D96B27]/30">
              PENDING
            </span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Uploading offline workouts and personal records to cloud.
          </p>
        </div>

        {/* 3. All data synced (SUCCESS) */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#008B8E]" />
              <h4 className="text-sm font-bold text-[#0F172A]">All data synced</h4>
            </div>
            <span className="bg-[#008B8E]/10 text-[#008B8E] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#008B8E]/30">
              SUCCESS
            </span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Your local database is completely up to date with the server.
          </p>
        </div>

        {/* 4. Sync failed (ERROR) & TAP TO RETRY */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-[#EF4444]" />
              <h4 className="text-sm font-bold text-[#0F172A]">Sync failed</h4>
            </div>
            <span className="bg-[#EF4444]/10 text-[#EF4444] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-[#EF4444]/30">
              ERROR
            </span>
          </div>
          <p className="text-xs text-[#475569] leading-relaxed">
            Unable to reach server database. Check your internet connection.
          </p>

          <button
            type="button"
            onClick={() => triggerSync()}
            className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-[#CBD5E1] cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <RotateCw size={14} className={status.syncState === 'syncing' ? 'animate-spin' : ''} />
            <span>{status.syncState === 'syncing' ? 'SYNCING...' : 'TAP TO RETRY'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SyncStatusModal;
