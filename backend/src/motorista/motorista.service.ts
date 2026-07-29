import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Motorista } from '../entities/motorista.entity';

@Injectable()
export class MotoristaService {
  constructor(
    @InjectRepository(Motorista)
    private readonly motoristaRepository: Repository<Motorista>,
  ) {}

  async findOrCreate(cpf: string, nome: string): Promise<Motorista> {
    const existing = await this.motoristaRepository.findOne({
      where: { cpf },
    });
    if (existing) return existing;

    const motorista = this.motoristaRepository.create({
      id: uuidv7(),
      cpf,
      full_name: nome ?? 'Não Informado',
    });
    return this.motoristaRepository.save(motorista);
  }
}
