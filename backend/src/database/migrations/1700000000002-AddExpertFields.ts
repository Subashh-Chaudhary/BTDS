import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpertFields1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the existing table if it exists
    await queryRunner.query(`DROP TABLE IF EXISTS "experts" CASCADE`);

    // Create the experts table with all required fields
    await queryRunner.query(`
      CREATE TABLE "experts" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL UNIQUE,
        "password" character varying(255) NOT NULL,
        "phone" character varying(255),
        "hospital_name" character varying(255),
        "specialization" character varying(255),
        "avatar_url" character varying(255),
        "qualification_docs" text[],
        "is_verified" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "verification_token" character varying(255),
        "verification_token_expires_at" TIMESTAMP,
        "password_reset_token" character varying(255),
        "reset_token_expires_at" TIMESTAMP,
        "refresh_token" character varying(255),
        "refresh_token_expires_at" TIMESTAMP,
        "last_login_at" TIMESTAMP,
        "auth_provider" character varying(255),
        "provider_id" character varying(255),
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the experts table
    await queryRunner.query(`DROP TABLE IF EXISTS "experts" CASCADE`);

    // Create the original table structure
    await queryRunner.query(`
      CREATE TABLE "experts" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL UNIQUE,
        "password" character varying(255) NOT NULL,
        "phone" character varying(255),
        "address" text,
        "qualification" text,
        "avatar_url" character varying(255),
        "is_verified" boolean DEFAULT false,
        "is_active" boolean DEFAULT true,
        "verification_token" character varying(255),
        "verification_token_expires_at" TIMESTAMP,
        "password_reset_token" character varying(255),
        "reset_token_expires_at" TIMESTAMP,
        "refresh_token" character varying(255),
        "refresh_token_expires_at" TIMESTAMP,
        "last_login_at" TIMESTAMP,
        "auth_provider" character varying(255),
        "provider_id" character varying(255),
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      )
    `);
  }
}
