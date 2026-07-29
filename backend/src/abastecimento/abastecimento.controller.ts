import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { AbastecimentoService } from './abastecimento.service';
import {
  PaginatedAbastecimentoResponseDto,
} from './dto/abastecimento-response.dto';
import { CreateAbastecimentoDto } from './dto/create-abastecimento.dto';

@ApiTags('Abastecimentos')
@Controller('abastecimentos')
export class AbastecimentoController {
  constructor(private readonly abastecimentoService: AbastecimentoService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registra um novo abastecimento',
    description:
      'Persiste um abastecimento a partir do payload bruto da API externa. ' +
      'Idempotente: duplicatas (mesmo protocolo_number) são ignoradas silenciosamente.',
  })
  @ApiResponse({
    status: 201,
    description: 'Abastecimento criado ou ignorado (duplicata).',
    schema: {
      example: { protocolo_number: '100000000000506', status: 'created' },
    },
  })
  async create(@Body() createAbastecimentoDto: CreateAbastecimentoDto) {
    return this.abastecimentoService.create(createAbastecimentoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista abastecimentos paginados',
    description:
      'Retorna os abastecimentos ordenados por data decrescente, com itens e relações. ' +
      'O campo raw_payload é omitido por segurança.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de abastecimentos.',
    type: PaginatedAbastecimentoResponseDto,
  })
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedAbastecimentoResponseDto> {
    return this.abastecimentoService.findAll(query);
  }
}
