'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import ReceiptView from '@/components/ReceiptView';
import SkeletonReceipt from '@/components/SkeletonReceipt';
import { fetchAbastecimentoById } from '@/lib/api';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function AbastecimentoDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['abastecimento', id],
    queryFn: () => fetchAbastecimentoById(id),
    enabled: Boolean(id),
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header />

      <main className="flex-1 flex flex-col justify-center items-center py-6 px-4">
        {isLoading && <SkeletonReceipt />}

        {isError && (
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 text-center space-y-4 my-8">
            <div className="inline-flex p-3 bg-rose-950/60 text-rose-400 rounded-full border border-rose-800">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              Não foi possível carregar o comprovante
            </h3>
            <p className="text-xs text-slate-400">
              {(error as Error)?.message ||
                'O registro solicitado não foi encontrado ou o servidor está indisponível.'}
            </p>
            <div className="flex justify-center space-x-3 pt-2">
              <Link
                href="/abastecimentos"
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </Link>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tentar novamente</span>
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && data && <ReceiptView abastecimento={data} />}
      </main>
    </div>
  );
}
