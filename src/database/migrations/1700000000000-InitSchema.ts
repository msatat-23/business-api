import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // UUID generation support
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    // Role enum
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'editor', 'admin')`,
    );

    // ---------------------------------------------------------------
    // users
    // ---------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "fullName" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying NOT NULL,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );

    // ---------------------------------------------------------------
    // home_page (singleton row, id is always 1)
    // ---------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "home_page" (
        "id" integer NOT NULL DEFAULT 1,
        "site" jsonb,
        "heroSection" jsonb,
        "heroDashboard" jsonb,
        "chartData" jsonb,
        "navigation" jsonb,
        "services" jsonb,
        "capabilities" jsonb,
        "methodology" jsonb,
        "roadmap" jsonb,
        "portfolio" jsonb,
        "sectorPlaybooks" jsonb,
        "updatedByEmail" character varying,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_home_page_id" PRIMARY KEY ("id")
      )
    `);

    // ---------------------------------------------------------------
    // contacts
    // ---------------------------------------------------------------
    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "fullName" character varying(150) NOT NULL,
        "phone" character varying(30) NOT NULL,
        "jobTitle" character varying(150) NOT NULL,
        "email" character varying(255) NOT NULL,
        "submittedByUserId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contacts_id" PRIMARY KEY ("id")
      )
    `);

    // FK contacts.submittedByUserId -> users.id (nullable, set null on user delete)
    await queryRunner.query(`
      ALTER TABLE "contacts"
      ADD CONSTRAINT "FK_contacts_submittedByUserId"
      FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP CONSTRAINT "FK_contacts_submittedByUserId"`,
    );
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TABLE "home_page"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
