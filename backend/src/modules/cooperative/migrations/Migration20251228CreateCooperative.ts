import { Migration } from "@mikro-orm/migrations"

export class Migration20251228CreateCooperative extends Migration {
  async up(): Promise<void> {
    // Create enums
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "cooperative_type_enum" AS ENUM ('FARM_COOP', 'FOOD_HUB', 'CSA', 'BUYING_CLUB', 'INDIGENOUS', 'WORKER_OWNED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "cooperative_member_role_enum" AS ENUM ('ADMIN', 'COORDINATOR', 'PRODUCER', 'MEMBER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "aggregation_method_enum" AS ENUM ('POOLED', 'INDIVIDUAL', 'HYBRID');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create cooperative table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cooperative" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "description" TEXT NULL,
        "cooperative_type" cooperative_type_enum NOT NULL DEFAULT 'FARM_COOP',
        "region" TEXT NULL,
        "state" TEXT NULL,
        "country_code" TEXT NULL,
        "address_line" TEXT NULL,
        "postal_code" TEXT NULL,
        "email" TEXT NULL,
        "phone" TEXT NULL,
        "website" TEXT NULL,
        "logo" TEXT NULL,
        "cover_image" TEXT NULL,
        "default_platform_commission" REAL NOT NULL DEFAULT 0,
        "default_coop_fee" REAL NOT NULL DEFAULT 0,
        "public_storefront_enabled" BOOLEAN NOT NULL DEFAULT true,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "governance_model" TEXT NULL,
        "membership_requirements" TEXT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "verified_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "cooperative_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create cooperative indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cooperative_handle" ON "cooperative" ("handle") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cooperative_type" ON "cooperative" ("cooperative_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cooperative_region" ON "cooperative" ("region") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cooperative_public" ON "cooperative" ("public_storefront_enabled") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cooperative_active" ON "cooperative" ("is_active") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_cooperative_name_search" ON "cooperative" USING gin(to_tsvector('english', "name")) WHERE "deleted_at" IS NULL;`)

    // Create cooperative_member table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cooperative_member" (
        "id" TEXT NOT NULL,
        "cooperative_id" TEXT NOT NULL,
        "producer_id" TEXT NOT NULL,
        "role" cooperative_member_role_enum NOT NULL DEFAULT 'PRODUCER',
        "revenue_share_percent" REAL NULL,
        "joined_at" TIMESTAMPTZ NOT NULL,
        "membership_number" TEXT NULL,
        "max_products" INTEGER NULL,
        "max_monthly_revenue" REAL NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "suspended_at" TIMESTAMPTZ NULL,
        "suspension_reason" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "cooperative_member_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "cooperative_member_cooperative_fk" FOREIGN KEY ("cooperative_id") REFERENCES "cooperative" ("id") ON DELETE CASCADE
      );
    `)

    // Create cooperative_member indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_member_cooperative" ON "cooperative_member" ("cooperative_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_member_producer" ON "cooperative_member" ("producer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_member_role" ON "cooperative_member" ("role") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_member_active" ON "cooperative_member" ("is_active") WHERE "deleted_at" IS NULL;`)
    
    // Unique constraint: producer can only be a member of a cooperative once
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_coop_member_unique" ON "cooperative_member" ("cooperative_id", "producer_id") WHERE "deleted_at" IS NULL;`)

    // Create cooperative_listing table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cooperative_listing" (
        "id" TEXT NOT NULL,
        "cooperative_id" TEXT NOT NULL,
        "product_id" TEXT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NULL,
        "aggregation_method" aggregation_method_enum NOT NULL DEFAULT 'POOLED',
        "unified_price" REAL NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'usd',
        "availability_window_ids" JSONB NULL,
        "total_quantity_available" REAL NOT NULL DEFAULT 0,
        "unit" TEXT NULL,
        "aggregation_point" TEXT NULL,
        "aggregation_deadline" TIMESTAMPTZ NULL,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "cooperative_listing_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "cooperative_listing_cooperative_fk" FOREIGN KEY ("cooperative_id") REFERENCES "cooperative" ("id") ON DELETE CASCADE
      );
    `)

    // Create cooperative_listing indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_listing_cooperative" ON "cooperative_listing" ("cooperative_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_listing_product" ON "cooperative_listing" ("product_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_listing_active" ON "cooperative_listing" ("is_active") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_listing_featured" ON "cooperative_listing" ("featured") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_coop_listing_name_search" ON "cooperative_listing" USING gin(to_tsvector('english', "name")) WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "cooperative_listing" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "cooperative_member" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "cooperative" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "aggregation_method_enum";')
    this.addSql('DROP TYPE IF EXISTS "cooperative_member_role_enum";')
    this.addSql('DROP TYPE IF EXISTS "cooperative_type_enum";')
  }
}
