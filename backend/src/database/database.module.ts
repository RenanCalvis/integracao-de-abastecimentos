import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

/**
 * DatabaseModule
 *
 * Configura a conexão com o PostgreSQL via TypeORM.
 *
 * - A URL de conexão é lida da variável de ambiente DATABASE_URL,
 *   que é injetada pelo Docker Compose no serviço `backend`.
 * - `synchronize: true` é habilitado EXCLUSIVAMENTE para o ambiente
 *   de desenvolvimento inicial. Deve ser desabilitado antes de qualquer
 *   deploy em produção.
 * - `autoLoadEntities: true` garante que entidades registradas via
 *   TypeOrmModule.forFeature() nos módulos de domínio sejam carregadas
 *   automaticamente, sem necessidade de listá-las aqui manualmente.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
