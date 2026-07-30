import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemAbastecimentoResponseDto {
  @ApiProperty({ example: '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b' })
  id: string;

  @ApiProperty({ example: 'Gasolina Comum' })
  product_display_name: string;

  @ApiProperty({ example: 'gasolina-comum' })
  product_slug: string;

  @ApiProperty({ example: '84.6' })
  quantity: string;

  @ApiProperty({ example: '6.63' })
  unit_price: string;

  @ApiProperty({ example: '560.898' })
  line_total: string;

  @ApiProperty({ example: true })
  complete_tank: boolean;

  @ApiProperty()
  created_at: Date;
}

export class PostoResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ example: 'Rede Sol Combustiveis LTDA' })
  trade_name: string;
  @ApiProperty({ example: '10000001000190' })
  cnpj: string;
}

export class FilialResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ example: 'Expresso Centro Oeste LTDA' })
  name: string;
  @ApiProperty({ example: '20000003000132' })
  cnpj: string;
  @ApiPropertyOptional({ example: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  company_id: string | null;
}

export class MotoristaResponseDto {
  @ApiProperty()
  id: string;
  @ApiProperty({ example: 'Warley Moraes' })
  full_name: string;
  @ApiProperty({ example: '68010511137' })
  cpf: string;
}

export class AbastecimentoListResponseDto {
  @ApiProperty({ example: '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b' })
  id: string;

  @ApiProperty({ example: '100000000000506' })
  protocolo_number: string;

  @ApiProperty({ example: '330.68' })
  total_amount: string;

  @ApiProperty({ example: '84.6' })
  total_liters: string;

  @ApiProperty({ example: 'MSQ7I34' })
  vehicle_plate: string;

  @ApiProperty({ example: '2026-07-27T16:50:50.080Z' })
  fueling_date: Date;

  @ApiProperty({ example: { full_name: 'Warley Moraes' } })
  motorista: { full_name: string };

  @ApiProperty({ example: { trade_name: 'Sh Informatica LTDA' } })
  posto: { trade_name: string };
}

export class AbastecimentoResponseDto {
  @ApiProperty({ example: '018f1a2b-3c4d-7e5f-8a9b-0c1d2e3f4a5b' })
  id: string;

  @ApiProperty({ example: '100000000000506' })
  protocolo_number: string;

  @ApiProperty({ example: '330.68' })
  total_amount: string;

  @ApiProperty({ example: '84.6' })
  total_liters: string;

  @ApiProperty({ example: 'MSQ7I34' })
  vehicle_plate: string;

  @ApiProperty({ example: '2026-07-27T16:50:50.080Z' })
  fueling_date: Date;

  @ApiProperty({ example: '68010511137' })
  buyer_cpf: string;

  @ApiProperty({ example: 'Warley Moraes' })
  buyer_full_name: string;

  @ApiProperty({ example: '10000001000190' })
  establishment_cnpj: string;

  @ApiProperty({ example: 'fuel' })
  type_fuel: string;

  @ApiProperty({ example: 'government_allocation' })
  origin: string;

  @ApiPropertyOptional({ example: 'Uso informado: 197731km.' })
  observations: string | null;

  @ApiPropertyOptional({
    example:
      'http://localhost:3103/comprovantes/comprovante-100000000000506.pdf',
  })
  receipt_url: string | null;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;

  @ApiProperty({ type: () => PostoResponseDto })
  posto: PostoResponseDto;

  @ApiProperty({ type: () => FilialResponseDto })
  filial: FilialResponseDto;

  @ApiProperty({ type: () => MotoristaResponseDto })
  motorista: MotoristaResponseDto;

  @ApiProperty({ type: () => [ItemAbastecimentoResponseDto] })
  items: ItemAbastecimentoResponseDto[];
}

export class PaginatedAbastecimentoResponseDto {
  @ApiProperty({ type: () => [AbastecimentoResponseDto] })
  data: AbastecimentoResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 342 })
  total: number;

  @ApiProperty({ example: 18 })
  total_pages: number;
}
export class PaginatedAbastecimentoListResponseDto {
  @ApiProperty({ type: () => [AbastecimentoListResponseDto] })
  data: AbastecimentoListResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 342 })
  total: number;

  @ApiProperty({ example: 18 })
  total_pages: number;
}

export class ComprovanteResponseDto {
  @ApiProperty({
    example:
      'http://localhost:3103/comprovantes/comprovante-100000000000506.pdf',
  })
  url: string;
}
