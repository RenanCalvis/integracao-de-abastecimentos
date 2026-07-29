import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Posto } from '../entities/posto.entity';

@Injectable()
export class PostoService {
  constructor(
    @InjectRepository(Posto)
    private readonly postoRepository: Repository<Posto>,
  ) {}

  async findOrCreate(cnpj: string, nomeFantasia: string): Promise<Posto> {
    const existing = await this.postoRepository.findOne({ where: { cnpj } });
    if (existing) return existing;

    const posto = this.postoRepository.create({
      id: uuidv7(),
      cnpj,
      trade_name: nomeFantasia ?? 'Não Informado',
    });
    return this.postoRepository.save(posto);
  }
}
