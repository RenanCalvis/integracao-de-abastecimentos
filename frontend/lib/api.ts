import {
  Abastecimento,
  AbastecimentoFilters,
  PaginatedAbastecimentoResponse,
  SyncReportResponse,
} from '@/types/abastecimento';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';

export async function fetchAbastecimentos(
  filters: AbastecimentoFilters = {},
): Promise<PaginatedAbastecimentoResponse> {
  const query = new URLSearchParams();

  if (filters.page) query.append('page', String(filters.page));
  if (filters.limit) query.append('limit', String(filters.limit));
  if (filters.vehicle) query.append('vehicle', filters.vehicle);
  if (filters.buyer_cpf) query.append('buyer_cpf', filters.buyer_cpf);
  if (filters.establishment_cnpj)
    query.append('establishment_cnpj', filters.establishment_cnpj);
  if (filters.date_from) query.append('date_from', filters.date_from);
  if (filters.date_to) query.append('date_to', filters.date_to);

  const url = `${API_BASE_URL}/abastecimentos?${query.toString()}`;
  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Falha ao carregar abastecimentos (Status ${res.status})`);
  }

  return res.json();
}

export async function fetchAbastecimentoById(id: string): Promise<Abastecimento> {
  const url = `${API_BASE_URL}/abastecimentos/${id}`;
  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Abastecimento com ID '${id}' não encontrado.`);
  }

  return res.json();
}

export async function fetchComprovanteUrl(id: string): Promise<{ url: string }> {
  const url = `${API_BASE_URL}/abastecimentos/${id}/comprovante`;
  const res = await fetch(url, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Erro ao obter comprovante (Status ${res.status})`);
  }

  return res.json();
}

export async function triggerSync(): Promise<SyncReportResponse> {
  const url = `${API_BASE_URL}/abastecimentos/sync`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Erro ao disparar sincronização (Status ${res.status})`);
  }

  return res.json();
}
