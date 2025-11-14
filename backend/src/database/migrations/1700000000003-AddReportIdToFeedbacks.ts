import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReportIdToFeedbacks1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable report_id column to feedbacks
    await queryRunner.query(`ALTER TABLE "feedbacks" ADD COLUMN "report_id" uuid`);

    // Create index for performance
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_feedbacks_report_id" ON "feedbacks" ("report_id")`);

    // Add foreign key constraint linking feedbacks.report_id -> reports.id
    await queryRunner.query(`ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_feedbacks_report" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop FK, index, and column in reverse order
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT IF EXISTS "FK_feedbacks_report"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_feedbacks_report_id"`);
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP COLUMN IF EXISTS "report_id"`);
  }
}
