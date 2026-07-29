/**
 * Contrato do payload bruto retornado pela API externa de abastecimentos.
 */
export interface RawAbastecimentoPayload {
  protocolo_number: string;
  created_at: string;
  vehicle: string;
  buyer_full_name: string;
  buyer_cpf: string;
  type_fuel: string;
  origin: string;
  client_branch_official_name: string;
  client_branch_cnpj: string;
  establishment_official_name: string;
  establishment_cnpj: string;
  empresa_id: string;
  observations: string | null;
  responsible: string | null;
  first_government_allocation_office_number: string | null;
  payment_method_id: string | null;
  foto_painel_url: string | null;
  line_items: RawLineItem[];
}

export interface RawLineItem {
  product: {
    category: {
      perma_name: string;
      display_name: string;
    };
    perma_name: string;
    display_name: string;
  };
  quantity: string;
  unit_price: string;
  complete_tank: boolean;
}
