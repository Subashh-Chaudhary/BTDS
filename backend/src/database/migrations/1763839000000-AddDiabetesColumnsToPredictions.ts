import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiabetesColumnsToPredictions1763839000000 implements MigrationInterface {
    name = 'AddDiabetesColumnsToPredictions1763839000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "user_id" uuid`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "pregnancies" integer`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "glucose" integer`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "blood_pressure" integer`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "skin_thickness" integer`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "insulin" integer`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "bmi" double precision`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "diabetes_pedigree_function" double precision`);
        await queryRunner.query(`ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "age" integer`);
        await queryRunner.query(`ALTER TABLE "predictions" ALTER COLUMN "created_at" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "predictions" ALTER COLUMN "updated_at" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "age"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "diabetes_pedigree_function"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "bmi"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "insulin"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "skin_thickness"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "blood_pressure"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "glucose"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "pregnancies"`);
        await queryRunner.query(`ALTER TABLE "predictions" DROP COLUMN IF EXISTS "user_id"`);
    }
}
