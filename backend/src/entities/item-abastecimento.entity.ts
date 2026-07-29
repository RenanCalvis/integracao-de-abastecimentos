import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';
import { NumericTransformer } from '../common/transformers/numeric.transformer';
import { Abastecimento } from './abastecimento.entity';

@Entity('itens_abastecimento')
export class ItemAbastecimento {
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Abastecimento, (abastecimento) => abastecimento.items, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'abastecimento_id' })
  abastecimento: Abastecimento;

  @Column({ name: 'product_display_name' })
  product_display_name: string;

  @Column({ name: 'product_slug' })
  product_slug: string;

  @Column({ type: 'numeric', transformer: NumericTransformer })
  quantity: string;

  @Column({ name: 'unit_price', type: 'numeric', transformer: NumericTransformer })
  unit_price: string;

  @Column({ name: 'line_total', type: 'numeric', transformer: NumericTransformer })
  line_total: string;

  @Column({ name: 'complete_tank', type: 'boolean', default: false })
  complete_tank: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv7();
  }
}
