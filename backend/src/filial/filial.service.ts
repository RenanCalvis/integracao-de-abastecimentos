import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Filial } from '../entities/filial.entity';

@Injectable()
export class FilialService {
  constructor(
    @InjectRepository(Filial)
    private readonly filialRepository: Repository<Filial>,
  ) {}

  async findOrCreate(
    cnpj: string,
    nome: string,
    empresaId: string,
  ): Promise<Filial> {
    const existing = await this.filialRepository.findOne({ where: { cnpj } });
    if (existing) return existing;

    const filial = this.filialRepository.create({
      id: uuidv7(),
      cnpj,
      name: nome ?? 'Não Informado',
      company_id: empresaId ?? null,
    });
    return this.filialRepository.save(filial);
  }
}
