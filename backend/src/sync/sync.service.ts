import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import { SyncState } from '../entities/sync-state.entity';
import { SyncLog, SyncTrigger } from '../entities/sync-log.entity';
import { AbastecimentoService } from '../abastecimento/abastecimento.service';
import { RawAbastecimentoPayload } from '../abastecimento/interfaces/raw-abastecimento-payload.interface';

export interface SyncReport {
  log_id: string;
  trigger: SyncTrigger;
  started_at: Date;
  finished_at: Date;
  pages_fetched: number;
  total_created: number;
  total_ignored: number;
  total_errors: number;
  duration_ms: number;
}

interface SyncApiResponse {
  data: RawAbastecimentoPayload[];
  next_cursor: string | null;
  has_more: boolean;
}

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private API_URL: string;
  private LIMIT: number;
  private isSyncing = false;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly abastecimentoService: AbastecimentoService,
    @InjectRepository(SyncState)
    private readonly syncStateRepo: Repository<SyncState>,
    @InjectRepository(SyncLog)
    private readonly syncLogRepo: Repository<SyncLog>,
  ) {
    const baseUrl = this.configService.get<string>('BASE_URL');
    this.API_URL = `${baseUrl}/v1/protocolos/sync`;
    this.LIMIT = this.configService.get<number>('LIMIT_SYNC', 50);
  }

  @Cron(CronExpression.EVERY_12_HOURS)
  async runScheduled(): Promise<void> {
    this.logger.log('[Scheduled] Disparando sincronização automática...');
    await this.runSync('scheduled');
  }

  async runSync(trigger: SyncTrigger = 'manual'): Promise<SyncReport> {
    if (this.isSyncing) {
      this.logger.warn(
        `Sincronização já em andamento. Trigger '${trigger}' ignorado.`,
      );
      throw new Error('Sincronização já em andamento.');
    }

    this.isSyncing = true;

    const log = this.syncLogRepo.create({
      trigger,
      status: 'running',
      finished_at: null,
      error_message: null,
    });
    await this.syncLogRepo.save(log);

    const stats = {
      pages_fetched: 0,
      total_created: 0,
      total_ignored: 0,
      total_errors: 0,
    };
    const token = this.configService.get<string>('API_TOKEN');

    const state = await this.syncStateRepo.findOne({
      where: { id: 'default' },
    });
    let cursor: string | null = state?.last_cursor ?? null;

    this.logger.log(
      `▶ [${trigger.toUpperCase()}] Iniciando sync | cursor inicial: ${cursor ?? 'nenhum (primeira execução)'}`,
    );

    try {
      while (true) {
        const params: Record<string, string | number> = { limit: this.LIMIT };
        if (cursor) params.cursor = cursor;

        let response: SyncApiResponse;

        try {
          const { data } = await firstValueFrom(
            this.httpService.get<SyncApiResponse>(this.API_URL, {
              headers: { Authorization: `Bearer ${token}` },
              params,
            }),
          );
          response = data;
        } catch (err) {
          const msg = `Erro de rede na página ${stats.pages_fetched + 1}: ${(err as Error).message}`;
          this.logger.error(msg);
          await this.finalizeLog(log, 'error', stats, msg);
          throw err;
        }

        stats.pages_fetched++;
        const batch = response.data ?? [];
        this.logger.log(
          `Página ${stats.pages_fetched}: ${batch.length} registros.`,
        );

        for (const rawJson of batch) {
          try {
            const result =
              await this.abastecimentoService.persistOnePublic(rawJson);
            if (result.status === 'created') stats.total_created++;
            else stats.total_ignored++;
          } catch (err) {
            this.logger.warn(
              `Falha ao persistir protocolo ${rawJson?.protocolo_number}: ${(err as Error).message}`,
            );
            stats.total_errors++;
          }
        }

        if (response.next_cursor) {
          cursor = response.next_cursor;
          await this.saveCursor(cursor);
        }

        if (!response.has_more || !response.next_cursor) break;
      }

      await this.finalizeLog(log, 'success', stats, null);
    } finally {
      this.isSyncing = false;
    }

    this.logger.log(
      `[${trigger.toUpperCase()}] Sync concluído | ` +
        `Páginas: ${stats.pages_fetched} | ` +
        `Criados: ${stats.total_created} | ` +
        `Ignorados: ${stats.total_ignored} | ` +
        `Erros: ${stats.total_errors}`,
    );

    return {
      log_id: log.id,
      trigger,
      started_at: log.started_at,
      finished_at: log.finished_at!,
      duration_ms: log.finished_at!.getTime() - log.started_at.getTime(),
      ...stats,
    };
  }

  //Helpers privados
  private async saveCursor(cursor: string): Promise<void> {
    await this.syncStateRepo.upsert(
      { id: 'default', last_cursor: cursor, last_sync_at: new Date() },
      ['id'],
    );
  }

  private async finalizeLog(
    log: SyncLog,
    status: 'success' | 'error',
    stats: {
      pages_fetched: number;
      total_created: number;
      total_ignored: number;
      total_errors: number;
    },
    errorMessage: string | null,
  ): Promise<void> {
    log.status = status;
    log.finished_at = new Date();
    log.pages_fetched = stats.pages_fetched;
    log.total_created = stats.total_created;
    log.total_ignored = stats.total_ignored;
    log.total_errors = stats.total_errors;
    log.error_message = errorMessage;
    await this.syncLogRepo.save(log);
  }
}
