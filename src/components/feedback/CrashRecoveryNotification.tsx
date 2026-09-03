import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CheckCircle2, X } from 'lucide-react';
import { crashRecoveryService, CrashRecoveryResult } from '../../services/recovery/crashRecoveryService';

export const CrashRecoveryNotification: React.FC = () => {
  const navigate = useNavigate();
  const [recoveryData, setRecoveryData] = useState<CrashRecoveryResult | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const unsubscribe = crashRecoveryService.subscribe((result) => {
      if (result.recovered) {
        setRecoveryData(result);
      }
    });

    // Run check on mount
    crashRecoveryService.checkAndRecover();

    return unsubscribe;
  }, []);

  if (!recoveryData || !recoveryData.recovered || dismissed) return null;

  return (
    <div className="fixed top-3 left-4 right-4 sm:left-auto sm:right-6 z-[9990] max-w-md bg-white border border-[#008B8E]/40 rounded-2xl p-3.5 shadow-xl animate-scale-up backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#008B8E]/12 text-[#008B8E] flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[#0F172A] block leading-tight">
              Active workout restored.
            </span>
            <span className="text-[11px] text-[#64748B] block mt-0.5 truncate">
              {recoveryData.session?.routineName} • {recoveryData.completedSetsCount || 0} sets saved
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Dismiss recovery banner"
        >
          <X size={15} />
        </button>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          Dismiss
        </button>
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            navigate('/workout-mode');
          }}
          className="px-3.5 py-1.5 bg-[#008B8E] hover:bg-[#00A3A6] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
        >
          <Play size={11} fill="currentColor" />
          <span>Resume Workout</span>
        </button>
      </div>
    </div>
  );
};
