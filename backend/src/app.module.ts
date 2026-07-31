import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AbastecimentoModule } from './abastecimento/abastecimento.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),

    DatabaseModule,
    AbastecimentoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
