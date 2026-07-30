'use client';

import Link from 'next/link';
import { Calendar, Car, Store, ChevronRight } from 'lucide-react';
import { Abastecimento } from '@/types/abastecimento';
import { formatCurrency, formatDate, formatLiters } from '@/lib/format';

interface FuelingCardProps {
  abastecimento: Abastecimento;
}

export default function FuelingCard({ abastecimento }: FuelingCardProps) {
  const driverName =
    abastecimento.motorista?.full_name ||
    abastecimento.buyer_full_name ||
    'Motorista Não Informado';
  const stationName =
    abastecimento.posto?.trade_name || 'Estabelecimento Não Informado';

  return (
    <Link href={`/abastecimentos/${abastecimento.id}`} className="block group">
      <div className="bg-slate-800 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500/50 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Informações Principais (Esquerda) */}
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                {driverName}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-700/80 text-slate-300 border border-slate-600/50">
                #{abastecimento.protocolo_number}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDate(abastecimento.fueling_date)}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono uppercase font-semibold text-slate-300">
                  {abastecimento.vehicle_plate}
                </span>
              </div>

              <div className="flex items-center space-x-1 truncate max-w-xs">
                <Store className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{stationName}</span>
              </div>
            </div>
          </div>

          {/* Valores e Ações (Direita) */}
          <div className="flex items-center justify-between sm:justify-end space-x-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-700/50">
            <div className="text-left sm:text-right">
              <div className="text-lg font-bold text-blue-400 font-mono tracking-tight">
                {formatCurrency(abastecimento.total_amount)}
              </div>
              <div className="text-xs text-slate-400 font-medium">
                {formatLiters(abastecimento.total_liters)}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-blue-600 text-slate-400 group-hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
