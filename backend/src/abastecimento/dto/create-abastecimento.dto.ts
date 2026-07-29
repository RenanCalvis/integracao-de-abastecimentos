import { ApiProperty } from '@nestjs/swagger';

class LineItemProductCategoryDto {
  @ApiProperty({ example: 'fuel' })
  perma_name: string;

  @ApiProperty({ example: 'Abastecimento' })
  display_name: string;
}

class LineItemProductDto {
  @ApiProperty({ type: LineItemProductCategoryDto })
  category: LineItemProductCategoryDto;

  @ApiProperty({ example: 'gasolina-comum' })
  perma_name: string;

  @ApiProperty({ example: 'Gasolina Comum' })
  display_name: string;
}

class LineItemDto {
  @ApiProperty({ type: LineItemProductDto })
  product: LineItemProductDto;

  @ApiProperty({ description: 'Quantidade em litros', example: '84.6' })
  quantity: string;

  @ApiProperty({ description: 'Preço unitário', example: '6.63' })
  unit_price: string;

  @ApiProperty({ example: true })
  complete_tank: boolean;
}

export class CreateAbastecimentoDto {
  @ApiProperty({ example: '100000000000506' })
  protocolo_number: string;

  @ApiProperty({ example: '2026-07-27T16:50:50.080Z' })
  created_at: string;

  @ApiProperty({ description: 'Placa do veículo', example: 'MSQ7I34' })
  vehicle: string;

  @ApiProperty({ example: 'Warley Moraes' })
  buyer_full_name: string;

  @ApiProperty({ example: '68010511137' })
  buyer_cpf: string;

  @ApiProperty({ example: 'Expresso Centro Oeste LTDA' })
  client_branch_official_name: string;

  @ApiProperty({ example: '20000003000132' })
  client_branch_cnpj: string;

  @ApiProperty({ example: 'Rede Sol Combustiveis LTDA' })
  establishment_official_name: string;

  @ApiProperty({ example: '10000001000190' })
  establishment_cnpj: string;

  @ApiProperty({ example: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d' })
  empresa_id: string;

  @ApiProperty({ type: [LineItemDto] })
  line_items: LineItemDto[];

  @ApiProperty({ nullable: true, required: false, example: null })
  observations: string | null;

  @ApiProperty({ nullable: true, required: false, example: null })
  responsible: string | null;

  @ApiProperty({ nullable: true, required: false, example: null })
  payment_method_id: string | null;

  @ApiProperty({ nullable: true, required: false, example: null })
  foto_painel_url: string | null;

  @ApiProperty({ nullable: true, required: false, example: null })
  first_government_allocation_office_number: string | null;
}
