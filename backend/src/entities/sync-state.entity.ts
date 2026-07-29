import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sync_state')
export class SyncState {
  @PrimaryColumn({ type: 'varchar', default: 'default' })
  id: string;

  @Column({ name: 'last_cursor', type: 'varchar', nullable: true })
  last_cursor: string | null;

  @Column({ name: 'last_sync_at', type: 'timestamptz', nullable: true })
  last_sync_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
