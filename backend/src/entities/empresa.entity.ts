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
import { Filial } from './filial.entity';

@Entity('empresas')
export class Empresa {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'nome_razao_social' })
  nome_razao_social: string;

  @Column({ unique: true })
  cnpj: string;

  @OneToMany(() => Filial, (filial) => filial.empresa)
  filiais: Filial[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv7();
  }
}
