import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Abastecimento } from '../entities/abastecimento.entity';
import { FilialService } from '../filial/filial.service';
import { ItemAbastecimentoService } from '../item-abastecimento/item-abastecimento.service';
import { MotoristaService } from '../motorista/motorista.service';
import { PostoService } from '../posto/posto.service';
import { ReceiptService } from '../receipt/receipt.service';
import { StorageService } from '../storage/storage.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import {
  AbastecimentoResponseDto,
  PaginatedAbastecimentoResponseDto,
} from './dto/abastecimento-response.dto';
import { CreateAbastecimentoDto } from './dto/create-abastecimento.dto';
import { RawAbastecimentoPayload } from './interfaces/raw-abastecimento-payload.interface';
import { AbastecimentoMapper } from './mappers/abastecimento.mapper';

@Injectable()
export class AbastecimentoService {
  private readonly logger = new Logger(AbastecimentoService.name);

  constructor(
    @InjectRepository(Abastecimento)
    private readonly abastecimentoRepository: Repository<Abastecimento>,
    private readonly motoristaService: MotoristaService,
    private readonly postoService: PostoService,
    private readonly filialService: FilialService,
    private readonly itemAbastecimentoService: ItemAbastecimentoService,
    private readonly receiptService: ReceiptService,
    private readonly storageService: StorageService,
  ) {}

  async getComprovanteUrl(id: string): Promise<{ url: string }> {
    const abastecimento = await this.abastecimentoRepository.findOne({
      where: { id },
      relations: { items: true, posto: true, filial: true, motorista: true },
    });

    if (!abastecimento) {
      throw new NotFoundException(
        `Abastecimento com ID '${id}' não encontrado.`,
      );
    }

    if (abastecimento.receipt_url) {
      return { url: abastecimento.receipt_url };
    }

    const pdfBuffer =
      await this.receiptService.generateReceiptPdf(abastecimento);
    const filename = `comprovante-${abastecimento.protocolo_number}.pdf`;
    const url = await this.storageService.uploadReceipt(filename, pdfBuffer);

    abastecimento.receipt_url = url;
    await this.abastecimentoRepository.save(abastecimento);

    return { url };
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedAbastecimentoResponseDto> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const [records, total] = await this.abastecimentoRepository.findAndCount({
      relations: { items: true, posto: true, filial: true, motorista: true },
      order: { fueling_date: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: records.map(this.toResponseDto),
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    };
  }

  async create(
    dto: CreateAbastecimentoDto,
  ): Promise<{ protocolo_number: string; status: 'created' | 'ignored' }> {
    const payload = dto as unknown as RawAbastecimentoPayload;
    return this.persistOne(payload);
  }

  async syncAbastecimentos(payloads: RawAbastecimentoPayload[]): Promise<void> {
    for (const rawJson of payloads) {
      try {
        await this.persistOne(rawJson);
      } catch (error) {
        this.logger.error(
          `Falha ao persistir protocolo ${rawJson?.protocolo_number}: ${(error as Error).message}`,
        );
      }
    }
  }

  // Exposto para SyncService: permite controle granular de erro por item
  async persistOnePublic(
    rawJson: RawAbastecimentoPayload,
  ): Promise<{ protocolo_number: string; status: 'created' | 'ignored' }> {
    return this.persistOne(rawJson);
  }

  private toResponseDto(entity: Abastecimento): AbastecimentoResponseDto {
    const { raw_payload: _omit, ...rest } = entity as any;
    return rest as AbastecimentoResponseDto;
  }

  private async persistOne(
    rawJson: RawAbastecimentoPayload,
  ): Promise<{ protocolo_number: string; status: 'created' | 'ignored' }> {
    const [motorista, posto, filial] = await Promise.all([
      this.motoristaService.findOrCreate(
        rawJson.buyer_cpf,
        rawJson.buyer_full_name,
      ),
      this.postoService.findOrCreate(
        rawJson.establishment_cnpj,
        rawJson.establishment_official_name,
      ),
      this.filialService.findOrCreate(
        rawJson.client_branch_cnpj,
        rawJson.client_branch_official_name,
        rawJson.empresa_id,
      ),
    ]);

    const entidade = AbastecimentoMapper.toDomain(rawJson);
    const abastecimentoId = uuidv7();

    const result = await this.abastecimentoRepository
      .createQueryBuilder()
      .insert()
      .into(Abastecimento)
      .values({
        ...entidade,
        id: abastecimentoId,
        motorista: { id: motorista.id },
        posto: { id: posto.id },
        filial: { id: filial.id },
      } as any)
      .orIgnore()
      .execute();

    const wasInserted = result.raw.length > 0;

    if (wasInserted) {
      await this.itemAbastecimentoService.createForAbastecimento(
        abastecimentoId,
        rawJson.line_items,
      );
    }

    const status = wasInserted ? 'created' : 'ignored';
    return { protocolo_number: rawJson.protocolo_number, status };
  }
}
