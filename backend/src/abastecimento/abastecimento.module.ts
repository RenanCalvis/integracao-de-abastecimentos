import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Abastecimento } from '../entities/abastecimento.entity';
import { SyncLog } from '../entities/sync-log.entity';
import { SyncState } from '../entities/sync-state.entity';
import { FilialModule } from '../filial/filial.module';
import { ItemAbastecimentoModule } from '../item-abastecimento/item-abastecimento.module';
import { MotoristaModule } from '../motorista/motorista.module';
import { PostoModule } from '../posto/posto.module';
import { ReceiptModule } from '../receipt/receipt.module';
import { StorageModule } from '../storage/storage.module';
import { SyncService } from '../sync/sync.service';
import { AbastecimentoController } from './abastecimento.controller';
import { AbastecimentoService } from './abastecimento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Abastecimento, SyncState, SyncLog]),
    HttpModule.register({ timeout: 30_000 }),
    ScheduleModule.forRoot(),
    MotoristaModule,
    PostoModule,
    FilialModule,
    ItemAbastecimentoModule,
    ReceiptModule,
    StorageModule,
  ],

  controllers: [AbastecimentoController],
  providers: [AbastecimentoService, SyncService],
  exports: [AbastecimentoService],
})
export class AbastecimentoModule {}
