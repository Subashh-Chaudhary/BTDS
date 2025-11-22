import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsVerifiedToReports1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_verified boolean column with default false
    await queryRunner.query(`ALTER TABLE "reports" ADD COLUMN "is_verified" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "reports" DROP COLUMN IF EXISTS "is_verified"`);
  }
}
