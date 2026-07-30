import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { SyncService, SyncReport } from '../sync/sync.service';
import { AbastecimentoService } from './abastecimento.service';
import {
  ComprovanteResponseDto,
  PaginatedAbastecimentoResponseDto,
} from './dto/abastecimento-response.dto';
import { CreateAbastecimentoDto } from './dto/create-abastecimento.dto';


@ApiTags('Abastecimentos')
@Controller('abastecimentos')
export class AbastecimentoController {
  constructor(
    private readonly abastecimentoService: AbastecimentoService,
    private readonly syncService: SyncService,
  ) {}

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
    schema: { example: { protocolo_number: '100000000000506', status: 'created' } },
  })
  async create(@Body() createAbastecimentoDto: CreateAbastecimentoDto) {
    return this.abastecimentoService.create(createAbastecimentoDto);
  }

  @Post('sync')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Dispara sincronização com a API externa',
    description:
      'Executa o loop de cursor-based pagination contra a API de protocolos, ' +
      'persistindo todos os abastecimentos de forma idempotente. ' +
      'Retorna um relatório com totais de criados, ignorados e erros.',
  })
  @ApiResponse({
    status: 200,
    description: 'Relatório da sincronização.',
    schema: {
      example: {
        pages_fetched: 5,
        total_processed: 247,
        total_created: 243,
        total_ignored: 4,
        total_errors: 0,
        duration_ms: 8342,
      },
    },
  })
  async sync(): Promise<SyncReport> {
    return this.syncService.runSync('manual');
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

  @Get(':id/comprovante')
  @ApiOperation({
    summary: 'Obtém a URL do comprovante do abastecimento',
    description:
      'Gera o comprovante PDF em estilo cupom fiscal sob demanda (Lazy Loading) caso ainda não exista, ' +
      'armazena no MinIO, atualiza a entidade com a URL gerada e a retorna.',
  })
  @ApiParam({ name: 'id', description: 'ID do abastecimento' })
  @ApiResponse({
    status: 200,
    description: 'URL do comprovante.',
    type: ComprovanteResponseDto,
  })
  async getComprovante(@Param('id') id: string): Promise<ComprovanteResponseDto> {
    return this.abastecimentoService.getComprovanteUrl(id);
  }
}

