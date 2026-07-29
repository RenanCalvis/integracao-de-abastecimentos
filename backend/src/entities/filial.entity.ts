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

@Entity('filiais')
export class Filial {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  cnpj: string;

  @Column({ name: 'company_id', type: 'varchar', nullable: true })
  company_id: string | null;

  @OneToMany(() => Abastecimento, (abastecimento) => abastecimento.filial)
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
