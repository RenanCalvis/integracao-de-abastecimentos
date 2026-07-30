'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inputs de estado local
  const [vehicle, setVehicle] = useState(searchParams.get('vehicle') || '');
  const [buyerCpf, setBuyerCpf] = useState(searchParams.get('buyer_cpf') || '');
  const [establishmentCnpj, setEstablishmentCnpj] = useState(
    searchParams.get('establishment_cnpj') || '',
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '');

  // Sincroniza com parâmetros de URL se mudarem externamente
  useEffect(() => {
    setVehicle(searchParams.get('vehicle') || '');
    setBuyerCpf(searchParams.get('buyer_cpf') || '');
    setEstablishmentCnpj(searchParams.get('establishment_cnpj') || '');
    setDateFrom(searchParams.get('date_from') || '');
    setDateTo(searchParams.get('date_to') || '');
  }, [searchParams]);

  // Atualiza a URL mantendo ou limpando parâmetros e reseta a página para 1
  const applyFilters = useCallback(
    (newParams: { [key: string]: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(newParams).forEach(([key, val]) => {
        if (val) {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      });

      // Reseta a pagina para 1 ao filtrar
      params.set('page', '1');

      router.push(`/abastecimentos?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({
      vehicle,
      buyer_cpf: buyerCpf,
      establishment_cnpj: establishmentCnpj,
      date_from: dateFrom,
      date_to: dateTo,
    });
  };

  const handleClear = () => {
    setVehicle('');
    setBuyerCpf('');
    setEstablishmentCnpj('');
    setDateFrom('');
    setDateTo('');

    const params = new URLSearchParams();
    params.set('page', '1');
    router.push(`/abastecimentos?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(
    vehicle || buyerCpf || establishmentCnpj || dateFrom || dateTo,
  );

  return (
    <form
      onSubmit={handleSearchSubmit}
      className="bg-slate-800 border border-slate-700/80 rounded-xl p-4 mb-6 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700/60">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-400" />
          <span>Filtros de Pesquisa</span>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Placa do Veículo */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Placa do Veículo
          </label>
          <input
            type="text"
            placeholder="Ex: MSQ7I34"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value.toUpperCase())}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all uppercase"
          />
        </div>

        {/* CPF do Motorista */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            CPF do Motorista
          </label>
          <input
            type="text"
            placeholder="Ex: 68010511137"
            value={buyerCpf}
            onChange={(e) => setBuyerCpf(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* CNPJ do Estabelecimento */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            CNPJ do Posto
          </label>
          <input
            type="text"
            placeholder="Ex: 10000001000190"
            value={establishmentCnpj}
            onChange={(e) => setEstablishmentCnpj(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Data Inicial
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all scheme-dark"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Data Final
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all scheme-dark"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Filtrar</span>
        </button>
      </div>
    </form>
  );
}
