import React, { useEffect, useState } from 'react';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useSyncStore } from '../../stores/useSyncStore';

export const OfflineBanner: React.FC = () => {
  const { status, setOnlineStatus } = useSyncStore();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setOnlineStatus(true);
    };
    const handleOffline = () => {
      setIsOffline(true);
      setOnlineStatus(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  if (!isOffline && status.isOnline) return null;

  return (
    <div className="bg-[#D96B27] border-b border-[#E57A36] text-white px-4 py-2 flex items-center gap-2 text-xs font-semibold animate-slide-up sticky top-0 z-50 shadow-md">
      <AlertTriangle size={16} className="text-white shrink-0" />
      <div className="flex-1">
        <span className="font-bold tracking-wide uppercase mr-1">OFFLINE MODE:</span>
        <span className="text-amber-50 font-normal">Changes saved locally and will sync automatically</span>
      </div>
      <WifiOff size={14} className="text-white/80 shrink-0" />
    </div>
  );
};
