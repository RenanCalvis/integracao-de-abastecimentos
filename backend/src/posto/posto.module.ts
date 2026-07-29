import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posto } from '../entities/posto.entity';
import { PostoService } from './posto.service';

@Module({
  imports: [TypeOrmModule.forFeature([Posto])],
  providers: [PostoService],
  exports: [PostoService],
})
export class PostoModule {}
