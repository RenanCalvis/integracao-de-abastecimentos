'use client';

import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import FuelingCard from '@/components/FuelingCard';
import Pagination from '@/components/Pagination';
import SkeletonCard from '@/components/SkeletonCard';
import { fetchAbastecimentos } from '@/lib/api';
import { AbastecimentoFilters } from '@/types/abastecimento';
import { AlertTriangle, RefreshCw, Fuel } from 'lucide-react';

function AbastecimentosContent() {
  const searchParams = useSearchParams();

  // Lê filtros diretamente da URL
  const filters: AbastecimentoFilters = {
    page: Number(searchParams.get('page')) || 1,
    limit: Number(searchParams.get('limit')) || 20,
    vehicle: searchParams.get('vehicle') || undefined,
    buyer_cpf: searchParams.get('buyer_cpf') || undefined,
    establishment_cnpj: searchParams.get('establishment_cnpj') || undefined,
    date_from: searchParams.get('date_from') || undefined,
    date_to: searchParams.get('date_to') || undefined,
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['abastecimentos', filters],
    queryFn: () => fetchAbastecimentos(filters),
  });

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Barra de Filtros */}
      <FilterBar />

      {/* Lista de Resultados */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-6 text-center space-y-3 my-8">
            <div className="inline-flex p-3 bg-rose-900/30 text-rose-400 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-rose-200">
              Falha ao carregar abastecimentos
            </h3>
            <p className="text-xs text-rose-300/80 max-w-md mx-auto">
              {(error as Error)?.message ||
                'Ocorreu um erro ao comunicar com a API. Tente novamente.'}
            </p>
            <div>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white rounded-lg text-xs font-semibold shadow transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar novamente</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && data && data.total === 0 && (
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-12 text-center space-y-3 my-6">
            <div className="inline-flex p-3 bg-slate-700/50 text-slate-400 rounded-full">
              <Fuel className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200">
              Nenhum abastecimento encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Não encontramos nenhum registro para os filtros selecionados.
              Tente alterar os termos ou limpar os filtros.
            </p>
          </div>
        )}

        {/* List Items */}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <div className="space-y-3">
            {data.data.map((abastecimento) => (
              <FuelingCard key={abastecimento.id} abastecimento={abastecimento} />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      {!isLoading && !isError && data && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          total={data.total}
          limit={data.limit}
        />
      )}
    </main>
  );
}

export default function AbastecimentosPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />
      <Suspense
        fallback={
          <div className="max-w-7xl w-full mx-auto px-4 py-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        }
      >
        <AbastecimentosContent />
      </Suspense>
    </div>
  );
}
