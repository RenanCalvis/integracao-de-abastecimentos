import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateVehiclePlateGinIndex1785439006341 implements MigrationInterface {
  name = 'CreateVehiclePlateGinIndex1785439006341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_abastecimentos_vehicle_plate_trgm" ON "abastecimentos" USING gin ("vehicle_plate" gin_trgm_ops);`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_abastecimentos_vehicle_plate_trgm";`,
    );
  }
}
