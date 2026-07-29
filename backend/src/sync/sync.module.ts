import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AbastecimentoModule } from '../abastecimento/abastecimento.module';
import { SyncService } from './sync.service';

@Module({
  imports: [
    HttpModule.register({ timeout: 30_000 }),
    AbastecimentoModule,
  ],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
