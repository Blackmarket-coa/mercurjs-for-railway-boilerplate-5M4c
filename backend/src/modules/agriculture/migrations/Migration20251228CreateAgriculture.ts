import { Migration } from "@mikro-orm/migrations"

export class Migration20251228CreateAgriculture extends Migration {
  async up(): Promise<void> {
    // Create enums
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "season_enum" AS ENUM ('SPRING', 'SUMMER', 'FALL', 'WINTER', 'YEAR_ROUND');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "harvest_visibility_enum" AS ENUM ('DRAFT', 'PREVIEW', 'PUBLIC', 'ARCHIVED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "lot_grade_enum" AS ENUM ('PREMIUM', 'GRADE_A', 'GRADE_B', 'PROCESSING', 'IMPERFECT', 'SECONDS');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "lot_allocation_enum" AS ENUM ('RETAIL', 'RESTAURANT', 'WHOLESALE', 'CSA', 'COOPERATIVE', 'DONATION', 'PROCESSING');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "sales_channel_enum" AS ENUM ('DTC', 'B2B', 'CSA', 'WHOLESALE', 'FARMERS_MARKET');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "pricing_strategy_enum" AS ENUM ('FIXED', 'TIERED', 'DYNAMIC', 'AUCTION', 'NEGOTIATED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create harvest table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "harvest" (
        "id" TEXT NOT NULL,
        "producer_id" TEXT NOT NULL,
        "crop_name" TEXT NOT NULL,
        "variety" TEXT NULL,
        "category" TEXT NULL,
        "harvest_date" TIMESTAMPTZ NULL,
        "planted_date" TIMESTAMPTZ NULL,
        "season" season_enum NOT NULL DEFAULT 'YEAR_ROUND',
        "year" INTEGER NOT NULL,
        "growing_method" TEXT NULL,
        "field_name" TEXT NULL,
        "farmer_notes" TEXT NULL,
        "weather_notes" TEXT NULL,
        "taste_notes" TEXT NULL,
        "usage_tips" TEXT NULL,
        "photo" TEXT NULL,
        "gallery" JSONB NULL,
        "expected_yield_quantity" REAL NULL,
        "expected_yield_unit" TEXT NULL,
        "visibility_status" harvest_visibility_enum NOT NULL DEFAULT 'DRAFT',
        "published_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "harvest_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create harvest indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_producer" ON "harvest" ("producer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_crop" ON "harvest" ("crop_name") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_season" ON "harvest" ("season") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_year" ON "harvest" ("year") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_visibility" ON "harvest" ("visibility_status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_date" ON "harvest" ("harvest_date") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_harvest_crop_search" ON "harvest" USING gin(to_tsvector('english', "crop_name")) WHERE "deleted_at" IS NULL;`)

    // Create lot table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "lot" (
        "id" TEXT NOT NULL,
        "harvest_id" TEXT NOT NULL,
        "lot_number" TEXT NULL,
        "batch_date" TIMESTAMPTZ NULL,
        "grade" lot_grade_enum NOT NULL DEFAULT 'GRADE_A',
        "size_class" TEXT NULL,
        "quantity_total" REAL NOT NULL,
        "quantity_available" REAL NOT NULL,
        "quantity_reserved" REAL NOT NULL DEFAULT 0,
        "quantity_sold" REAL NOT NULL DEFAULT 0,
        "unit" TEXT NOT NULL,
        "suggested_price_per_unit" REAL NULL,
        "cost_per_unit" REAL NULL,
        "allocation_type" lot_allocation_enum NOT NULL DEFAULT 'RETAIL',
        "surplus_flag" BOOLEAN NOT NULL DEFAULT false,
        "surplus_declared_at" TIMESTAMPTZ NULL,
        "surplus_reason" TEXT NULL,
        "best_by_date" TIMESTAMPTZ NULL,
        "use_by_date" TIMESTAMPTZ NULL,
        "storage_location" TEXT NULL,
        "storage_requirements" TEXT NULL,
        "external_lot_id" TEXT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "lot_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "lot_harvest_fk" FOREIGN KEY ("harvest_id") REFERENCES "harvest" ("id") ON DELETE CASCADE
      );
    `)

    // Create lot indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lot_harvest" ON "lot" ("harvest_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lot_grade" ON "lot" ("grade") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lot_allocation" ON "lot" ("allocation_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lot_surplus" ON "lot" ("surplus_flag") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lot_active" ON "lot" ("is_active") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_lot_best_by" ON "lot" ("best_by_date") WHERE "deleted_at" IS NULL;`)

    // Create availability_window table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "availability_window" (
        "id" TEXT NOT NULL,
        "lot_id" TEXT NOT NULL,
        "product_id" TEXT NULL,
        "available_from" TIMESTAMPTZ NOT NULL,
        "available_until" TIMESTAMPTZ NULL,
        "sales_channel" sales_channel_enum NOT NULL DEFAULT 'DTC',
        "pricing_strategy" pricing_strategy_enum NOT NULL DEFAULT 'FIXED',
        "unit_price" REAL NOT NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'usd',
        "price_tiers" JSONB NULL,
        "min_order_quantity" REAL NULL,
        "max_order_quantity" REAL NULL,
        "quantity_increment" REAL NULL,
        "preorder_enabled" BOOLEAN NOT NULL DEFAULT false,
        "preorder_deposit_percent" REAL NULL,
        "estimated_ship_date" TIMESTAMPTZ NULL,
        "pickup_enabled" BOOLEAN NOT NULL DEFAULT true,
        "delivery_enabled" BOOLEAN NOT NULL DEFAULT true,
        "shipping_enabled" BOOLEAN NOT NULL DEFAULT false,
        "pickup_locations" JSONB NULL,
        "fulfillment_lead_time_hours" INTEGER NULL,
        "surplus_discount_percent" REAL NULL,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "sort_order" INTEGER NOT NULL DEFAULT 0,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "paused_at" TIMESTAMPTZ NULL,
        "pause_reason" TEXT NULL,
        "view_count" INTEGER NOT NULL DEFAULT 0,
        "order_count" INTEGER NOT NULL DEFAULT 0,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "availability_window_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "availability_window_lot_fk" FOREIGN KEY ("lot_id") REFERENCES "lot" ("id") ON DELETE CASCADE
      );
    `)

    // Create availability_window indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_lot" ON "availability_window" ("lot_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_product" ON "availability_window" ("product_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_channel" ON "availability_window" ("sales_channel") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_from" ON "availability_window" ("available_from") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_until" ON "availability_window" ("available_until") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_active" ON "availability_window" ("is_active") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_preorder" ON "availability_window" ("preorder_enabled") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_availability_featured" ON "availability_window" ("featured") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "availability_window" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "lot" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "harvest" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "pricing_strategy_enum";')
    this.addSql('DROP TYPE IF EXISTS "sales_channel_enum";')
    this.addSql('DROP TYPE IF EXISTS "lot_allocation_enum";')
    this.addSql('DROP TYPE IF EXISTS "lot_grade_enum";')
    this.addSql('DROP TYPE IF EXISTS "harvest_visibility_enum";')
    this.addSql('DROP TYPE IF EXISTS "season_enum";')
  }
}
