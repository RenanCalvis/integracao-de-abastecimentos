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

@Entity('motoristas')
export class Motorista {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  full_name: string;

  @Column({ unique: true })
  cpf: string;

  @OneToMany(() => Abastecimento, (abastecimento) => abastecimento.motorista)
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
