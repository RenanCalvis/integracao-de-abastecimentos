'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

export default function Pagination({
  page,
  totalPages,
  total,
  limit,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/abastecimentos?${params.toString()}`);
  };

  if (total === 0 || totalPages <= 1) return null;

  const fromIndex = (page - 1) * limit + 1;
  const toIndex = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
      <div>
        Exibindo <span className="font-semibold text-slate-200">{fromIndex}</span> até{' '}
        <span className="font-semibold text-slate-200">{toIndex}</span> de{' '}
        <span className="font-semibold text-slate-200">{total}</span> registros
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </button>

        <span className="px-3 py-1.5 font-medium text-slate-300">
          Página {page} de {totalPages}
        </span>

        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          <span>Próxima</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
