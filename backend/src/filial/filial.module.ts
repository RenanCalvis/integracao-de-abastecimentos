import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Filial } from '../entities/filial.entity';
import { FilialService } from './filial.service';

@Module({
  imports: [TypeOrmModule.forFeature([Filial])],
  providers: [FilialService],
  exports: [FilialService],
})
export class FilialModule {}
