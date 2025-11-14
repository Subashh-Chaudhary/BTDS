import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertExpertsIdToUuid1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // WARNING: This migration converts experts.id from integer to uuid.
    // BACKUP your database before running it.

    // 1) Add a new uuid column to experts and populate it
    await queryRunner.query(`ALTER TABLE "experts" ADD COLUMN "new_id" uuid DEFAULT uuid_generate_v4()`);
    await queryRunner.query(`UPDATE "experts" SET "new_id" = uuid_generate_v4() WHERE "new_id" IS NULL`);

    // 2) Add a new column to feedbacks to hold the new uuid FK
    await queryRunner.query(`ALTER TABLE "feedbacks" ADD COLUMN "expert_id_new" uuid`);

    // 3) Populate feedbacks.expert_id_new by mapping old expert integer id -> experts.new_id
    await queryRunner.query(`UPDATE "feedbacks" SET "expert_id_new" = e."new_id" FROM "experts" e WHERE e."id"::text = "feedbacks"."expert_id"::text`);

    // 4) Drop FK constraint on feedbacks referencing experts (if exists)
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT IF EXISTS "FK_feedbacks_experts"`);

    // 5) Replace experts primary key: drop old pk, drop old id, rename new_id -> id
    await queryRunner.query(`ALTER TABLE "experts" DROP CONSTRAINT IF EXISTS "PK_experts"`);
    // Temporarily drop dependent default references if necessary
    await queryRunner.query(`ALTER TABLE "experts" DROP COLUMN IF EXISTS "id"`);
    await queryRunner.query(`ALTER TABLE "experts" RENAME COLUMN "new_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "experts" ADD CONSTRAINT "PK_experts" PRIMARY KEY ("id")`);

    // 6) Swap feedbacks columns: drop old expert_id, rename expert_id_new
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP COLUMN IF EXISTS "expert_id"`);
    await queryRunner.query(`ALTER TABLE "feedbacks" RENAME COLUMN "expert_id_new" TO "expert_id"`);

    // 7) Add FK constraint from feedbacks.expert_id -> experts.id
    await queryRunner.query(`ALTER TABLE "feedbacks" ADD CONSTRAINT "FK_feedbacks_experts" FOREIGN KEY ("expert_id") REFERENCES "experts"("id") ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverting this migration is non-trivial and may cause data loss. Implement with caution.
    // For safety, this down() attempts to reverse changes by recreating integer ids where possible.

    // 1) Drop FK
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT IF EXISTS "FK_feedbacks_experts"`);

    // 2) Add old id back as integer (best-effort - may not recover original ints)
    await queryRunner.query(`ALTER TABLE "experts" ADD COLUMN "old_id" integer`);

    // 3) Try to set old_id using sequence values (best-effort)
    await queryRunner.query(`UPDATE "experts" SET "old_id" = nextval('experts_id_seq'::regclass)`);

    // 4) Swap columns back: drop uuid id, rename old_id -> id
    await queryRunner.query(`ALTER TABLE "experts" DROP CONSTRAINT IF EXISTS "PK_experts"`);
    await queryRunner.query(`ALTER TABLE "experts" DROP COLUMN IF EXISTS "id"`);
    await queryRunner.query(`ALTER TABLE "experts" RENAME COLUMN "old_id" TO "id"`);
    await queryRunner.query(`ALTER TABLE "experts" ADD CONSTRAINT "PK_experts" PRIMARY KEY ("id")`);

    // 5) For feedbacks, nothing done here - user should manually repair if needed
  }
}
