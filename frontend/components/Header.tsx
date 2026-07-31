'use client';

import { useState } from 'react';
import { Fuel, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerSync } from '@/lib/api';

interface HeaderProps {
  onSyncComplete?: () => void;
}

export default function Header({ onSyncComplete }: HeaderProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);

    try {
      const report = await triggerSync();
      setSyncStatus({
        type: 'success',
        message: `Sync concluído! ${report.total_created} criados, ${report.total_ignored} ignorados em ${report.duration_ms}ms.`,
      });
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      setSyncStatus({
        type: 'error',
        message: (err as Error).message || 'Falha ao disparar sincronização.',
      });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  return (
    <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 text-blue-500 rounded-lg border border-blue-500/30">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 leading-tight">
              Gestão de Abastecimentos
            </h1>
          </div>
        </div>

        {/* Sync Button & Status Notification */}
        <div className="flex items-center space-x-4">
          {syncStatus && (
            <div
              className={`hidden md:flex items-center space-x-2 text-xs px-3 py-1.5 rounded-lg border animate-fade-in ${
                syncStatus.type === 'success'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-rose-950/60 text-rose-300 border-rose-800'
              }`}
            >
              {syncStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{syncStatus.message}</span>
            </div>
          )}

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
