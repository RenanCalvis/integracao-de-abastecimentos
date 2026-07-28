import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Filial } from './entities/filial.entity';
import { Posto } from './entities/posto.entity';
import { Motorista } from './entities/motorista.entity';
import { Abastecimento } from './entities/abastecimento.entity';
import { Empresa } from './entities/empresa.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Empresa, Filial, Posto, Motorista, Abastecimento]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
