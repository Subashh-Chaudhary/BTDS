import { MigrationInterface, QueryRunner } from "typeorm";

export class DropTumorTypeFromPredictions1763839600000 implements MigrationInterface {
  name = 'DropTumorTypeFromPredictions1763839600000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop tumor_type safely if present
    await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "tumor_type"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate column as nullable to allow rollback without data
    await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "tumor_type" character varying(255)`);
  }
}
