import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AbastecimentoService } from './abastecimento.service';
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
      'Persiste um abastecimento a partir do payload bruto da API externa. Idempotente: duplicatas (mesmo protocolo_number) são ignoradas silenciosamente.',
  })
  @ApiResponse({ status: 201, description: '{ protocolo_number, status: "created" | "ignored" }' })
  async create(@Body() createAbastecimentoDto: CreateAbastecimentoDto) {
    return this.abastecimentoService.create(createAbastecimentoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lista todos os abastecimentos',
    description: 'Retorna todos os registros de abastecimento persistidos.',
  })
  findAll() {
    return this.abastecimentoService.findAll();
  }
}
