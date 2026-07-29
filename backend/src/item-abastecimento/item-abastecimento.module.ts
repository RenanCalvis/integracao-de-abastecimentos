import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemAbastecimento } from '../entities/item-abastecimento.entity';
import { ItemAbastecimentoService } from './item-abastecimento.service';

@Module({
  imports: [TypeOrmModule.forFeature([ItemAbastecimento])],
  providers: [ItemAbastecimentoService],
  exports: [ItemAbastecimentoService],
})
export class ItemAbastecimentoModule {}
