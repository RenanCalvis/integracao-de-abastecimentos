import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';

export type SyncTrigger = 'manual' | 'scheduled';
export type SyncStatus = 'running' | 'success' | 'error';

@Entity('sync_logs')
export class SyncLog {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  trigger: SyncTrigger;

  @Column({ type: 'varchar', length: 20, default: 'running' })
  status: SyncStatus;

  @CreateDateColumn({ name: 'started_at' })
  started_at: Date;

  @Column({ name: 'finished_at', type: 'timestamptz', nullable: true })
  finished_at: Date | null;

  @Column({ name: 'pages_fetched', default: 0 })
  pages_fetched: number;

  @Column({ name: 'total_created', default: 0 })
  total_created: number;

  @Column({ name: 'total_ignored', default: 0 })
  total_ignored: number;

  @Column({ name: 'total_errors', default: 0 })
  total_errors: number;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  error_message: string | null;

  @BeforeInsert()
  generateId() {
    if (!this.id) this.id = uuidv7();
  }
}
