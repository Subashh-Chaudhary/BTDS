import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table first
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "password" character varying(255),
                "phone" character varying(20),
                "address" text,
                "avatar_url" character varying(512),
                "is_verified" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "verification_token" character varying(255),
                "verification_token_expires_at" TIMESTAMP WITH TIME ZONE,
                "password_reset_token" character varying(255),
                "reset_token_expires_at" TIMESTAMP WITH TIME ZONE,
                "refresh_token" character varying(255),
                "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE,
                "last_login_at" TIMESTAMP WITH TIME ZONE,
                "auth_provider" character varying(50),
                "provider_id" character varying(255),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_users_email" UNIQUE ("email"),
                CONSTRAINT "PK_users" PRIMARY KEY ("id")
            )
        `);

    // Create experts table
    await queryRunner.query(`
            CREATE TABLE "experts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "password" character varying(255),
                "phone" character varying(20),
                "address" text,
                "avatar_url" character varying(512),
                "qualification" text,
                "qualification_docs" character varying(512),
                "is_verified" boolean NOT NULL DEFAULT false,
                "is_active" boolean NOT NULL DEFAULT true,
                "verification_token" character varying(255),
                "verification_token_expires_at" TIMESTAMP WITH TIME ZONE,
                "password_reset_token" character varying(255),
                "reset_token_expires_at" TIMESTAMP WITH TIME ZONE,
                "refresh_token" character varying(255),
                "refresh_token_expires_at" TIMESTAMP WITH TIME ZONE,
                "last_login_at" TIMESTAMP WITH TIME ZONE,
                "auth_provider" character varying(50),
                "provider_id" character varying(255),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_experts_email" UNIQUE ("email"),
                CONSTRAINT "PK_experts" PRIMARY KEY ("id")
            )
        `);

    // Create predictions table
    await queryRunner.query(`
            CREATE TABLE "predictions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "tumor_type" character varying(255) NOT NULL,
                "confidence_score" double precision NOT NULL,
                "description" text,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_predictions" PRIMARY KEY ("id")
            )
        `);

    // Create scans table
    await queryRunner.query(`
            CREATE TABLE "scans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "image_url" character varying(512) NOT NULL,
                "user_id" uuid NOT NULL,
                "prediction_id" uuid,
                "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_scans" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_scans_prediction_id" UNIQUE ("prediction_id"),
                CONSTRAINT "FK_scans_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_scans_predictions" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE SET NULL
            )
        `);

    // Create treatments table
    await queryRunner.query(`
            CREATE TABLE "treatments" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "prediction_id" uuid NOT NULL,
                "description" text NOT NULL,
                "medication" text,
                "therapy_type" character varying(255),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_treatments" PRIMARY KEY ("id"),
                CONSTRAINT "FK_treatments_predictions" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE CASCADE
            )
        `);

    // Create feedbacks table
    await queryRunner.query(`
            CREATE TABLE "feedbacks" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "scan_id" uuid NOT NULL,
                "expert_id" uuid NOT NULL,
                "feedback_text" text NOT NULL,
                "verified_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_feedbacks" PRIMARY KEY ("id"),
                CONSTRAINT "FK_feedbacks_scans" FOREIGN KEY ("scan_id") REFERENCES "scans"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_feedbacks_experts" FOREIGN KEY ("expert_id") REFERENCES "experts"("id") ON DELETE CASCADE
            )
        `);

    // Create reports table with updated relations
    await queryRunner.query(`
            CREATE TABLE "reports" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid,
                "scan_id" uuid NOT NULL,
                "prediction_id" uuid NOT NULL,
                "treatment_id" uuid,
                "feedback_id" uuid,
                "report_url" text,
                "generated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_reports" PRIMARY KEY ("id"),
                CONSTRAINT "FK_reports_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_reports_scans" FOREIGN KEY ("scan_id") REFERENCES "scans"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_reports_predictions" FOREIGN KEY ("prediction_id") REFERENCES "predictions"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_reports_treatments" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_reports_feedbacks" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE SET NULL
            )
        `);

    // Create histories table
    await queryRunner.query(`
            CREATE TABLE "histories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "report_id" uuid NOT NULL,
                "viewed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_histories" PRIMARY KEY ("id"),
                CONSTRAINT "FK_histories_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_histories_reports" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order of creation to handle dependencies
    await queryRunner.query('DROP TABLE IF EXISTS "histories" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "reports" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "feedbacks" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "treatments" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "scans" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "predictions" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "experts" CASCADE');
    await queryRunner.query('DROP TABLE IF EXISTS "users" CASCADE');
  }
}
