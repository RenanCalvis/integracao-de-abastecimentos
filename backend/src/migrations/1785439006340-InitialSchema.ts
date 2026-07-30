import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1785439006340 implements MigrationInterface {
    name = 'InitialSchema1785439006340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "filiais" ("id" uuid NOT NULL, "name" character varying NOT NULL, "cnpj" character varying NOT NULL, "company_id" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_69b849a883435ef28afc72a6a0c" UNIQUE ("cnpj"), CONSTRAINT "PK_9cc507f6ebfb9cdeca7f05044f5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "itens_abastecimento" ("id" uuid NOT NULL, "product_display_name" character varying NOT NULL, "product_slug" character varying NOT NULL, "quantity" numeric NOT NULL, "unit_price" numeric NOT NULL, "line_total" numeric NOT NULL, "complete_tank" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "abastecimento_id" uuid NOT NULL, CONSTRAINT "PK_3b0090ccda79fb963ce0fe5f1a9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "motoristas" ("id" uuid NOT NULL, "full_name" character varying NOT NULL, "cpf" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1c999d54a9f79962e881ceaf75e" UNIQUE ("cpf"), CONSTRAINT "PK_bed77c88836201231df1d9314e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "postos" ("id" uuid NOT NULL, "trade_name" character varying NOT NULL, "cnpj" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6429755e40516cfdc44fbcb0cde" UNIQUE ("cnpj"), CONSTRAINT "PK_0ee80ffe0ef45d5b2c0dee5e7c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "abastecimentos" ("id" uuid NOT NULL, "protocolo_number" character varying NOT NULL, "total_amount" numeric NOT NULL, "total_liters" numeric NOT NULL, "vehicle_plate" character varying NOT NULL, "fueling_date" TIMESTAMP WITH TIME ZONE NOT NULL, "raw_payload" jsonb NOT NULL, "buyer_cpf" character varying NOT NULL, "buyer_full_name" character varying NOT NULL, "establishment_cnpj" character varying NOT NULL, "type_fuel" character varying(50) NOT NULL, "origin" character varying(50) NOT NULL, "observations" text, "receipt_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "filial_id" uuid NOT NULL, "posto_id" uuid NOT NULL, "motorista_id" uuid NOT NULL, CONSTRAINT "UQ_4592ff6aad229a0e69961f591a8" UNIQUE ("protocolo_number"), CONSTRAINT "PK_260411fe6bd22415cb7a5271302" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sync_logs" ("id" uuid NOT NULL, "trigger" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'running', "started_at" TIMESTAMP NOT NULL DEFAULT now(), "finished_at" TIMESTAMP WITH TIME ZONE, "pages_fetched" integer NOT NULL DEFAULT '0', "total_created" integer NOT NULL DEFAULT '0', "total_ignored" integer NOT NULL DEFAULT '0', "total_errors" integer NOT NULL DEFAULT '0', "error_message" text, CONSTRAINT "PK_f441fe15484e077c80ddec89336" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sync_state" ("id" character varying NOT NULL DEFAULT 'default', "last_cursor" character varying, "last_sync_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c68d03775b8818b4e50b6dba84" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "itens_abastecimento" ADD CONSTRAINT "FK_22ba15d955fa62a309ca52cd009" FOREIGN KEY ("abastecimento_id") REFERENCES "abastecimentos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "abastecimentos" ADD CONSTRAINT "FK_aa5f3e80fea1b3777f92fadc60c" FOREIGN KEY ("filial_id") REFERENCES "filiais"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "abastecimentos" ADD CONSTRAINT "FK_ddfbfcabcf972fbc671053a3f69" FOREIGN KEY ("posto_id") REFERENCES "postos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "abastecimentos" ADD CONSTRAINT "FK_9da2f12b07ab129ad57d5541371" FOREIGN KEY ("motorista_id") REFERENCES "motoristas"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "abastecimentos" DROP CONSTRAINT "FK_9da2f12b07ab129ad57d5541371"`);
        await queryRunner.query(`ALTER TABLE "abastecimentos" DROP CONSTRAINT "FK_ddfbfcabcf972fbc671053a3f69"`);
        await queryRunner.query(`ALTER TABLE "abastecimentos" DROP CONSTRAINT "FK_aa5f3e80fea1b3777f92fadc60c"`);
        await queryRunner.query(`ALTER TABLE "itens_abastecimento" DROP CONSTRAINT "FK_22ba15d955fa62a309ca52cd009"`);
        await queryRunner.query(`DROP TABLE "sync_state"`);
        await queryRunner.query(`DROP TABLE "sync_logs"`);
        await queryRunner.query(`DROP TABLE "abastecimentos"`);
        await queryRunner.query(`DROP TABLE "postos"`);
        await queryRunner.query(`DROP TABLE "motoristas"`);
        await queryRunner.query(`DROP TABLE "itens_abastecimento"`);
        await queryRunner.query(`DROP TABLE "filiais"`);
    }

}
