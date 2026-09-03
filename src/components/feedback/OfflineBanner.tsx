import React from 'react';
import { WifiOff, Database } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-[#D96B27] text-white px-3.5 py-1.5 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase sticky top-0 z-50 shadow-sm animate-slide-up border-b border-[#C25B1E] select-none">
      <div className="flex items-center gap-2">
        <WifiOff size={13} className="text-white shrink-0" />
        <span>OFFLINE MODE • LOCAL DATA ACTIVE</span>
      </div>

      <div className="flex items-center gap-1 text-[10px] text-amber-100 font-semibold lowercase">
        <Database size={11} />
        <span>indexedDB ready</span>
      </div>
    </div>
  );
};
