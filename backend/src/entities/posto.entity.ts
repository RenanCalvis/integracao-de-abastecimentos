import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Abastecimento } from './abastecimento.entity';

@Entity('postos')
export class Posto {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'nome_fantasia' })
  nome_fantasia: string;

  @Column({ unique: true })
  cnpj: string;

  @OneToMany(() => Abastecimento, (abastecimento) => abastecimento.posto)
  abastecimentos: Abastecimento[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv7();
  }
}
