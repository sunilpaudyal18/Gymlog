import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-[#D96B27] text-white px-3.5 py-1.5 flex items-center justify-center gap-2 text-[11px] font-bold tracking-wider uppercase sticky top-0 z-50 shadow-sm animate-slide-up border-b border-[#C25B1E] select-none">
      <WifiOff size={13} className="text-white shrink-0" />
      <span>OFFLINE MODE ACTIVE</span>
    </div>
  );
};
