'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, ShieldCheck, Fuel } from 'lucide-react';
import { Abastecimento } from '@/types/abastecimento';
import {
  formatCurrency,
  formatDate,
  formatLiters,
  formatCpf,
  formatCnpj,
} from '@/lib/format';
import { fetchComprovanteUrl } from '@/lib/api';

interface ReceiptViewProps {
  abastecimento: Abastecimento;
}

function translateOrigin(origin: string): string {
  const map: Record<string, string> = {
    government_allocation: 'Alocação Governamental',
  };
  return map[origin] || origin;
}

function translateTypeFuel(fuel: string): string {
  const map: Record<string, string> = {
    fuel: 'Combustível',
  };
  return map[fuel] || fuel;
}

export default function ReceiptView({ abastecimento }: ReceiptViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setPdfError(null);

    try {
      // Chama o backend para obter a URL do comprovante (Lazy Loading)
      const data = await fetchComprovanteUrl(abastecimento.id);
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('URL do comprovante não retornada pelo servidor.');
      }
    } catch (err) {
      setPdfError((err as Error).message || 'Erro ao gerar PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const stationName =
    abastecimento.posto?.trade_name || 'Estabelecimento Não Informado';
  const stationCnpj =
    abastecimento.posto?.cnpj || abastecimento.establishment_cnpj;
  const branchName = abastecimento.filial?.name || 'Filial Não Informada';
  const branchCnpj = abastecimento.filial?.cnpj;
  const driverName =
    abastecimento.motorista?.full_name ||
    abastecimento.buyer_full_name ||
    'Motorista Não Informado';
  const driverCpf = abastecimento.motorista?.cpf || abastecimento.buyer_cpf;

  return (
    <div className="max-w-lg mx-auto py-6 px-4">
      {/* Botão Voltar */}
      <div className="mb-6">
        <Link
          href="/abastecimentos"
          className="inline-flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a listagem</span>
        </Link>
      </div>

      {/* Container do Comprovante - Estilo Cupom Fiscal Térmico */}
      <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white text-slate-900 transition-all">
        {/* Top Serrated Edge */}
        <div className="serrated-top-edge"></div>

        {/* Conteúdo do Cupom */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Cabeçalho */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center p-2 bg-slate-100 rounded-full text-slate-800 mb-1">
              <Fuel className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase">
              Cupom de Abastecimento
            </h2>
            <p className="text-xs font-mono text-slate-500">
              Protocolo {abastecimento.protocolo_number}
            </p>
            <p className="text-xs text-slate-500">
              Data do abastecimento: {formatDate(abastecimento.fueling_date)}
            </p>
          </div>

          <div className="border-t border-dashed border-slate-300"></div>

          {/* Dados do Estabelecimento / Posto */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              Posto / Estabelecimento
            </span>
            <p className="font-semibold text-slate-900 text-sm">
              {stationName}
            </p>
            <p className="text-slate-600 font-mono">
              CNPJ: {formatCnpj(stationCnpj)}
            </p>
          </div>

          {/* Dados da Filial / Cliente */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              Filial / Cliente
            </span>
            <p className="font-semibold text-slate-900">{branchName}</p>
            <p className="text-slate-600 font-mono">
              CNPJ: {formatCnpj(branchCnpj)}
            </p>
          </div>

          {/* Dados do Motorista e Veículo */}
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block mb-1">
              Motorista e Veículo
            </span>
            <p className="font-semibold text-slate-900">{driverName}</p>
            <p className="text-slate-600 font-mono">
              CPF: {formatCpf(driverCpf)}
            </p>
            <p className="text-slate-800">
              Placa do Veículo:{' '}
              <span className="font-mono font-bold uppercase text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                {abastecimento.vehicle_plate}
              </span>
            </p>
          </div>

          <div className="border-t border-dashed border-slate-300"></div>

          {/* Tabela de Itens */}
          <div className="space-y-3">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Itens Abastecidos
            </span>

            {abastecimento.items && abastecimento.items.length > 0 ? (
              <div className="space-y-2.5">
                {abastecimento.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex justify-between items-start text-xs leading-snug"
                  >
                    <div>
                      <p className="font-bold text-slate-900">
                        {item.product_display_name}
                      </p>
                      <p className="text-slate-500 font-mono text-[11px]">
                        {formatLiters(item.quantity)} x{' '}
                        {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 font-mono">
                      {formatCurrency(item.line_total)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Sem itens detalhados registrados.
              </p>
            )}
          </div>

          <div className="border-t-2 border-slate-900 pt-3"></div>

          {/* Totais */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900 uppercase">
                Total do Abastecimento
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(abastecimento.total_amount)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Litragem Total:</span>
              <span className="font-mono font-semibold text-slate-900">
                {formatLiters(abastecimento.total_liters)}
              </span>
            </div>

            <div className="flex justify-between text-xs text-slate-600">
              <span>Tipo / Origem:</span>
              <span className="font-medium text-slate-800">
                {translateTypeFuel(abastecimento.type_fuel)} ({translateOrigin(abastecimento.origin)})
              </span>
            </div>

            {abastecimento.observations && (
              <div className="mt-3 p-2 bg-slate-50 rounded text-xs text-slate-600 italic border border-slate-200">
                Obs: {abastecimento.observations}
              </div>
            )}
          </div>

          <div className="border-t border-dashed border-slate-300"></div>

          {/* Rodapé Fiscal / Autenticidade */}
          <div className="text-center space-y-1 text-[11px] text-slate-400">
            <div className="inline-flex items-center space-x-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-700">
                Comprovante Autêntico
              </span>
            </div>
            <p>Gerado pelo Sistema de Gestão GD Tech</p>
          </div>
        </div>

        {/* Bottom Serrated Edge */}
        <div className="serrated-bottom-edge"></div>
      </div>

      {/* Mensagem de Erro se houver */}
      {pdfError && (
        <div className="mt-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-lg text-xs">
          {pdfError}
        </div>
      )}

      {/* Botão de Ação para Baixar/Visualizar PDF */}
      <div className="mt-6">
        <button
          onClick={handleDownloadPdf}
          disabled={isGenerating}
          className="w-full inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer"
        >
          {isGenerating ? (
            <span>Gerando Comprovante PDF...</span>
          ) : (
            <>
              <span> Visualizar PDF do Comprovante</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
