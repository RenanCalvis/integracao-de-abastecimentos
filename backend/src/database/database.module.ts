import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

/**
 * DatabaseModule
 *
 * Configura a conexão com o PostgreSQL via TypeORM.
 *
 *  A URL de conexão é lida da variável de ambiente DATABASE_URL,
 *   que é injetada pelo Docker Compose no serviço `backend`.
 * migrations: Utiliza Glob Pattern (`join(__dirname, 'migrations', '*{.ts,.js}')`)
 *   para carregar automaticamente qualquer migration presente no diretório,
 *   sem necessidade de importação manual de cada classe.
 * migrationsRun: true` executa automaticamente as migrations pendentes na inicialização.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
      migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
      migrationsRun: true,
      extra: {
        options: '-c timezone=America/Campo_Grande',
      },
    }),
  ],
})
export class DatabaseModule {}
