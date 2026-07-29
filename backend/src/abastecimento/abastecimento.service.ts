import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Abastecimento } from '../entities/abastecimento.entity';
import { FilialService } from '../filial/filial.service';
import { ItemAbastecimentoService } from '../item-abastecimento/item-abastecimento.service';
import { MotoristaService } from '../motorista/motorista.service';
import { PostoService } from '../posto/posto.service';
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
  ) {}

  findAll(): Promise<Abastecimento[]> {
    return this.abastecimentoRepository.find({ relations: { items: true } });
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

  private async persistOne(
    rawJson: RawAbastecimentoPayload,
  ): Promise<{ protocolo_number: string; status: 'created' | 'ignored' }> {
    const [motorista, posto, filial] = await Promise.all([
      this.motoristaService.findOrCreate(rawJson.buyer_cpf, rawJson.buyer_full_name),
      this.postoService.findOrCreate(rawJson.establishment_cnpj, rawJson.establishment_official_name),
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
