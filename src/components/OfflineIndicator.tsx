import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/90 text-white px-3.5 py-2 text-xs font-medium shadow-xl backdrop-blur-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>Tryb offline — aplikacja działa w 100% lokalnie na Twoim urządzeniu.</span>
    </div>
  );
};
