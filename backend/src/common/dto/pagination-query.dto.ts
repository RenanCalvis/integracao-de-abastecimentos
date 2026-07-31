import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Página (começa em 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Itens por página (max 100)',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Busca por número do protocolo (busca parcial ILIKE)',
    example: '100000000000506',
  })
  @IsOptional()
  @IsString()
  protocolo_number?: string;

  @ApiPropertyOptional({
    description: 'Busca por placa do veículo (busca parcial ILIKE)',
    example: 'MSQ7I34',
  })
  @IsOptional()
  @IsString()
  vehicle?: string;

  @ApiPropertyOptional({
    description: 'Busca por CPF do motorista (busca exata)',
    example: '68010511137',
  })
  @IsOptional()
  @IsString()
  buyer_cpf?: string;

  @ApiPropertyOptional({
    description: 'Busca por CNPJ do posto (busca exata)',
    example: '10000001000190',
  })
  @IsOptional()
  @IsString()
  establishment_cnpj?: string;

  @ApiPropertyOptional({
    description: 'Data inicial do abastecimento (ISO 8601 ou YYYY-MM-DD)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({
    description: 'Data final do abastecimento (ISO 8601 ou YYYY-MM-DD)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  date_to?: string;
}
