import { Migration } from "@mikro-orm/migrations"

export class Migration20260202CreatePasswordHistory extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "password_history_entry" (
        "id" TEXT NOT NULL,
        "auth_identity_id" TEXT NOT NULL,
        "actor_type" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "password_history_entry_pkey" PRIMARY KEY ("id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pwd_history_auth_identity" ON "password_history_entry" ("auth_identity_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pwd_history_actor_type" ON "password_history_entry" ("actor_type") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "password_history_entry" CASCADE;')
  }
}
