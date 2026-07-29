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
import { Filial } from './filial.entity';
import { ItemAbastecimento } from './item-abastecimento.entity';
import { Motorista } from './motorista.entity';
import { Posto } from './posto.entity';
import { NumericTransformer } from '../common/transformers/numeric.transformer';
/**
  TODO (Infra): Criar índice GIN com pg_trgm na coluna placa_veiculo via migration 
  para otimizar buscas parciais (ILIKE). 
  O decorator @Index() foi omitido intencionalmente para evitar que o TypeORM 
  crie um índice B-Tree conflitante durante o synchronize.
 */
@Entity('abastecimentos')
export class Abastecimento {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'protocolo_number', unique: true })
  protocolo_number: string;

  @Column({ type: 'numeric', transformer: NumericTransformer })
  total_amount: string;

  @Column({ type: 'numeric', transformer: NumericTransformer })
  total_liters: string;

  @Column()
  vehicle_plate: string;

  @Column({ type: 'timestamptz', name: 'fueling_date' })
  fueling_date: Date;

  // Armazena o payload original
  @Column({ type: 'jsonb', name: 'raw_payload' })
  raw_payload: Record<string, unknown>;

  // Campos desnormalizados para evitar JOINs em listagens simples
  @Column({ name: 'buyer_cpf' })
  buyer_cpf: string;

  @Column({ name: 'buyer_full_name' })
  buyer_full_name: string;

  @Column({ name: 'establishment_cnpj' })
  establishment_cnpj: string;

  @Column({ name: 'type_fuel', type: 'varchar', length: 50 })
  type_fuel: string;

  @Column({ name: 'origin', type: 'varchar', length: 50 })
  origin: string;

  @Column({ nullable: true, name: 'observations', type: 'text', default: null })
  observations: string | null;

  @ManyToOne(() => Filial, (filial) => filial.abastecimentos, {
    nullable: false,
  })
  @JoinColumn({ name: 'filial_id' })
  filial: Filial;

  @ManyToOne(() => Posto, (posto) => posto.abastecimentos, {
    nullable: false,
  })
  @JoinColumn({ name: 'posto_id' })
  posto: Posto;

  @ManyToOne(() => Motorista, (motorista) => motorista.abastecimentos, {
    nullable: false,
  })
  @JoinColumn({ name: 'motorista_id' })
  motorista: Motorista;

  @OneToMany(() => ItemAbastecimento, (item) => item.abastecimento, {
    cascade: true,
  })
  items: ItemAbastecimento[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv7();
  }
}
