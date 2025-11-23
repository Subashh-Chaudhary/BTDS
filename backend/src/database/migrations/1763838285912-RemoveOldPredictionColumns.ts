import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveOldPredictionColumns1763838285912 implements MigrationInterface {
    name = 'RemoveOldPredictionColumns1763838285912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove only the prediction columns we intentionally deleted from the entity.
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "model_type"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "input"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "output"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "confidence_score"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "description"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "output_image_url"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the dropped columns as nullable/defaulted to allow rollback.
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "model_type" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "input" jsonb`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "output" jsonb`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "confidence_score" double precision`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "description" text`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "output_image_url" character varying(512)`);
    }

}
