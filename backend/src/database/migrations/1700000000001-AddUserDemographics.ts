import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserDemographics1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "age" integer,
            ADD COLUMN IF NOT EXISTS "gender" character varying(50),
            ADD COLUMN IF NOT EXISTS "is_admin" boolean NOT NULL DEFAULT false
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN IF EXISTS "age",
            DROP COLUMN IF EXISTS "gender",
            DROP COLUMN IF EXISTS "is_admin"
        `);
  }
}
