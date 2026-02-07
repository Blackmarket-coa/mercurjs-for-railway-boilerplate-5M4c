import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260207120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "woocommerce_connection" (
        "id" TEXT NOT NULL,
        "seller_id" TEXT NOT NULL UNIQUE,
        "store_url" TEXT NOT NULL,
        "consumer_key" TEXT NOT NULL,
        "consumer_secret" TEXT NOT NULL,
        "store_name" TEXT NULL,
        "currency" TEXT NULL,
        "sync_inventory" BOOLEAN NOT NULL DEFAULT true,
        "last_synced_at" TIMESTAMPTZ NULL,
        "last_sync_report" JSONB NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "woocommerce_connection_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_woo_connection_seller_id"
        ON "woocommerce_connection" ("seller_id")
        WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE TABLE IF NOT EXISTS "woocommerce_import_log" (
        "id" TEXT NOT NULL,
        "connection_id" TEXT NOT NULL,
        "status" TEXT CHECK ("status" IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')) NOT NULL DEFAULT 'pending',
        "total_products" INTEGER NOT NULL DEFAULT 0,
        "imported_count" INTEGER NOT NULL DEFAULT 0,
        "failed_count" INTEGER NOT NULL DEFAULT 0,
        "skipped_count" INTEGER NOT NULL DEFAULT 0,
        "import_as_draft" BOOLEAN NOT NULL DEFAULT true,
        "error_details" JSONB NULL,
        "started_at" TIMESTAMPTZ NULL,
        "completed_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "woocommerce_import_log_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_woo_import_log_status"
        ON "woocommerce_import_log" ("status")
        WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_woo_import_log_connection_id"
        ON "woocommerce_import_log" ("connection_id")
        WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      ALTER TABLE IF EXISTS "woocommerce_import_log"
        ADD CONSTRAINT "woocommerce_import_log_connection_id_foreign"
        FOREIGN KEY ("connection_id")
        REFERENCES "woocommerce_connection" ("id")
        ON UPDATE CASCADE ON DELETE CASCADE;
    `)
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE IF EXISTS "woocommerce_import_log"
        DROP CONSTRAINT IF EXISTS "woocommerce_import_log_connection_id_foreign";
    `)
    this.addSql('DROP TABLE IF EXISTS "woocommerce_import_log" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "woocommerce_connection" CASCADE;')
  }
}
