import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { Filial } from './filial.entity';
import { Posto } from './posto.entity';
import { Motorista } from './motorista.entity';
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

  @Column({ type: 'numeric', transformer: NumericTransformer })
  valor_total: string;

  @Column({ type: 'numeric', transformer: NumericTransformer })
  litragem: string;

  @Column()
  placa_veiculo: string;

  @Column({ type: 'timestamptz', name: 'data_abastecimento' })
  data_abastecimento: Date;

  // Armazena o payload original
  @Column({ type: 'jsonb', name: 'raw_payload' })
  raw_payload: Record<string, unknown>;

  // Campos desnormalizados para evitar JOINs em listagens simples
  @Column({ name: 'buyer_cpf' })
  buyer_cpf: string;

  @Column({ name: 'establishment_cnpj' })
  establishment_cnpj: string;

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

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv7();
  }
}
