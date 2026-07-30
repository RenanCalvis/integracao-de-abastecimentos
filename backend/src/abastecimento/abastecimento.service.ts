import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
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
  AbastecimentoListResponseDto,
  AbastecimentoResponseDto,
  PaginatedAbastecimentoListResponseDto,
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
  ): Promise<PaginatedAbastecimentoListResponseDto> {
    const {
      page,
      limit,
      vehicle,
      buyer_cpf,
      establishment_cnpj,
      date_from,
      date_to,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.abastecimentoRepository.createQueryBuilder('abastecimento');
    // .leftJoinAndSelect('abastecimento.posto', 'posto')
    // .leftJoinAndSelect('abastecimento.motorista', 'motorista');

    if (vehicle) {
      queryBuilder.andWhere('abastecimento.vehicle_plate ILIKE :vehicle', {
        vehicle: `%${vehicle}%`,
      });
    }

    if (buyer_cpf) {
      queryBuilder.andWhere('abastecimento.buyer_cpf = :buyer_cpf', {
        buyer_cpf,
      });
    }

    if (establishment_cnpj) {
      queryBuilder.andWhere(
        'abastecimento.establishment_cnpj = :establishment_cnpj',
        {
          establishment_cnpj,
        },
      );
    }

    if (date_from) {
      const fromDate = new Date(date_from);
      if (!isNaN(fromDate.getTime())) {
        queryBuilder.andWhere('abastecimento.fueling_date >= :date_from', {
          date_from: fromDate,
        });
      }
    }

    if (date_to) {
      const toDate = new Date(date_to);
      if (!isNaN(toDate.getTime())) {
        if (date_to.length <= 10) {
          toDate.setHours(23, 59, 59, 999);
        }
        queryBuilder.andWhere('abastecimento.fueling_date <= :date_to', {
          date_to: toDate,
        });
      }
    }

    queryBuilder
      .orderBy('abastecimento.fueling_date', 'DESC')
      .skip(skip)
      .take(limit);

    const [records, total] = await queryBuilder.getManyAndCount();

    return {
      data: records.map((entity) => this.toListResponseDto(entity)),
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<AbastecimentoResponseDto> {
    const abastecimento = await this.abastecimentoRepository.findOne({
      where: { id },
      relations: { items: true, posto: true, filial: true, motorista: true },
    });

    if (!abastecimento) {
      throw new NotFoundException(
        `Abastecimento com ID '${id}' não encontrado.`,
      );
    }

    return this.toResponseDto(abastecimento);
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

  private toListResponseDto(
    entity: Abastecimento,
  ): AbastecimentoListResponseDto {
    return {
      id: entity.id,
      protocolo_number: entity.protocolo_number,
      total_amount: entity.total_amount,
      total_liters: entity.total_liters,
      vehicle_plate: entity.vehicle_plate,
      fueling_date: entity.fueling_date,
      motorista: {
        full_name:
          entity.motorista?.full_name || entity.buyer_full_name || 'N/A',
      },
      posto: {
        trade_name: entity.posto?.trade_name || 'N/A',
      },
    };
  }

  private toResponseDto(entity: Abastecimento): AbastecimentoResponseDto {
    const dto: Record<string, unknown> = { ...entity };
    delete dto.raw_payload;
    return dto as unknown as AbastecimentoResponseDto;
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
      } as QueryDeepPartialEntity<Abastecimento>)

      .orIgnore()
      .execute();

    const rawInserted = result.raw as Array<unknown>;
    const wasInserted = Array.isArray(rawInserted) && rawInserted.length > 0;

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
