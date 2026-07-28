import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Empresa } from './empresa.entity';
import { Abastecimento } from './abastecimento.entity';

@Entity('filiais')
export class Filial {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  nome: string;

  @Column({ unique: true })
  cnpj: string;

  @ManyToOne(() => Empresa, (empresa) => empresa.filiais, { nullable: false })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

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
