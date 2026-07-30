export interface ItemAbastecimento {
  id?: string;
  product_display_name: string;
  product_slug: string;
  quantity: string;
  unit_price: string;
  line_total: string;
  complete_tank: boolean;
  created_at?: string;
}

export interface Posto {
  id?: string;
  trade_name: string;
  cnpj: string;
}

export interface Filial {
  id?: string;
  name: string;
  cnpj: string;
  company_id?: string | null;
}

export interface Motorista {
  id?: string;
  full_name: string;
  cpf: string;
}

export interface Abastecimento {
  id: string;
  protocolo_number: string;
  total_amount: string;
  total_liters: string;
  vehicle_plate: string;
  fueling_date: string;
  buyer_cpf: string;
  buyer_full_name: string;
  establishment_cnpj: string;
  type_fuel: string;
  origin: string;
  observations: string | null;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  posto: Posto;
  filial: Filial;
  motorista: Motorista;
  items: ItemAbastecimento[];
}

export interface PaginatedAbastecimentoResponse {
  data: Abastecimento[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AbastecimentoFilters {
  vehicle?: string;
  buyer_cpf?: string;
  establishment_cnpj?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface SyncReportResponse {
  log_id: string;
  trigger: 'manual' | 'scheduled';
  started_at: string;
  finished_at: string;
  pages_fetched: number;
  total_processed: number;
  total_created: number;
  total_ignored: number;
  total_errors: number;
  duration_ms: number;
}
