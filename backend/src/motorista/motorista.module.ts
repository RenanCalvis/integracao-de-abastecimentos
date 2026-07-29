import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Motorista } from '../entities/motorista.entity';
import { MotoristaService } from './motorista.service';

@Module({
  imports: [TypeOrmModule.forFeature([Motorista])],
  providers: [MotoristaService],
  exports: [MotoristaService],
})
export class MotoristaModule {}
