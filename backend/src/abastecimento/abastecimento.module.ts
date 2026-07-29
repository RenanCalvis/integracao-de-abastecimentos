import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Abastecimento } from '../entities/abastecimento.entity';
import { FilialModule } from '../filial/filial.module';
import { ItemAbastecimentoModule } from '../item-abastecimento/item-abastecimento.module';
import { MotoristaModule } from '../motorista/motorista.module';
import { PostoModule } from '../posto/posto.module';
import { AbastecimentoController } from './abastecimento.controller';
import { AbastecimentoService } from './abastecimento.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Abastecimento]),
    MotoristaModule,
    PostoModule,
    FilialModule,
    ItemAbastecimentoModule,
  ],
  controllers: [AbastecimentoController],
  providers: [AbastecimentoService],
})
export class AbastecimentoModule {}
