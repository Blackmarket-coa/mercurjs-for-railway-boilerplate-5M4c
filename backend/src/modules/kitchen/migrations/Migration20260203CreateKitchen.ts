import { Migration } from "@mikro-orm/migrations"

export class Migration20260203CreateKitchen extends Migration {
  async up(): Promise<void> {
    // Create enums for kitchen
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_type_enum" AS ENUM ('community', 'incubator', 'cooperative', 'nonprofit', 'church', 'school', 'municipal');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_status_enum" AS ENUM ('planning', 'active', 'renovation', 'closed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_governance_enum" AS ENUM ('equal_vote', 'usage_weighted', 'investment_weighted', 'hybrid');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create enums for kitchen_space
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_space_type_enum" AS ENUM ('general', 'bakery', 'cold_prep', 'hot_line', 'packaging', 'storage_cold', 'storage_dry', 'full_kitchen');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_space_status_enum" AS ENUM ('available', 'reserved', 'maintenance', 'unavailable');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_space_assignment_enum" AS ENUM ('hourly', 'daily', 'weekly', 'monthly', 'reserved');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create enums for kitchen_membership
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_membership_type_enum" AS ENUM ('hourly', 'monthly', 'annual', 'incubator', 'investor', 'staff', 'volunteer');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_membership_status_enum" AS ENUM ('pending', 'active', 'suspended', 'expired', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create enums for kitchen_equipment
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_equipment_category_enum" AS ENUM ('cooking', 'refrigeration', 'prep', 'storage', 'cleaning', 'smallwares', 'packaging', 'safety');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "kitchen_equipment_status_enum" AS ENUM ('operational', 'maintenance', 'repair', 'retired');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create kitchen table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "kitchen" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL,
        "state" TEXT NOT NULL,
        "zip" TEXT NOT NULL,
        "coordinates" JSONB NULL,
        "managing_org_id" TEXT NULL,
        "kitchen_type" kitchen_type_enum NOT NULL,
        "total_sqft" INTEGER NOT NULL DEFAULT 0,
        "total_stations" INTEGER NOT NULL DEFAULT 0,
        "max_concurrent_users" INTEGER NOT NULL DEFAULT 1,
        "health_permit_number" TEXT NULL,
        "health_permit_expires" TIMESTAMPTZ NULL,
        "certifications" JSONB NULL,
        "status" kitchen_status_enum NOT NULL DEFAULT 'planning',
        "governance_model" kitchen_governance_enum NOT NULL DEFAULT 'equal_vote',
        "operating_account_id" TEXT NULL,
        "equipment_fund_account_id" TEXT NULL,
        "maintenance_fund_account_id" TEXT NULL,
        "member_deposit_pool_id" TEXT NULL,
        "investment_pool_account_id" TEXT NULL,
        "hourly_rate" NUMERIC NULL,
        "monthly_membership_fee" NUMERIC NULL,
        "deposit_required" NUMERIC NULL,
        "settings" JSONB NULL,
        "operating_hours" JSONB NULL,
        "amenities" JSONB NULL,
        "equipment_list" JSONB NULL,
        "contact_email" TEXT NULL,
        "contact_phone" TEXT NULL,
        "website" TEXT NULL,
        "cover_image_url" TEXT NULL,
        "gallery_urls" JSONB NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "kitchen_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create kitchen indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_slug" ON "kitchen" ("slug") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_status" ON "kitchen" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_type" ON "kitchen" ("kitchen_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_city" ON "kitchen" ("city") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_state" ON "kitchen" ("state") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_managing_org" ON "kitchen" ("managing_org_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_name_search" ON "kitchen" USING gin(to_tsvector('english', "name")) WHERE "deleted_at" IS NULL;`)

    // Create kitchen_space table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "kitchen_space" (
        "id" TEXT NOT NULL,
        "kitchen_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NULL,
        "size_sqft" INTEGER NULL,
        "section" TEXT NULL,
        "space_type" kitchen_space_type_enum NOT NULL,
        "equipment" JSONB NULL,
        "hourly_rate" NUMERIC NULL,
        "daily_rate" NUMERIC NULL,
        "weekly_rate" NUMERIC NULL,
        "monthly_rate" NUMERIC NULL,
        "max_users" INTEGER NOT NULL DEFAULT 1,
        "status" kitchen_space_status_enum NOT NULL DEFAULT 'available',
        "assigned_member_id" TEXT NULL,
        "assignment_type" kitchen_space_assignment_enum NULL,
        "assignment_starts" TIMESTAMPTZ NULL,
        "assignment_ends" TIMESTAMPTZ NULL,
        "has_water_access" BOOLEAN NOT NULL DEFAULT true,
        "has_gas" BOOLEAN NOT NULL DEFAULT false,
        "has_hood_ventilation" BOOLEAN NOT NULL DEFAULT false,
        "is_accessible" BOOLEAN NOT NULL DEFAULT true,
        "last_deep_clean" TIMESTAMPTZ NULL,
        "last_equipment_service" TIMESTAMPTZ NULL,
        "maintenance_notes" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "kitchen_space_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "kitchen_space_kitchen_fk" FOREIGN KEY ("kitchen_id") REFERENCES "kitchen" ("id") ON DELETE CASCADE
      );
    `)

    // Create kitchen_space indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_space_kitchen" ON "kitchen_space" ("kitchen_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_space_status" ON "kitchen_space" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_space_type" ON "kitchen_space" ("space_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_space_assigned" ON "kitchen_space" ("assigned_member_id") WHERE "deleted_at" IS NULL;`)

    // Create kitchen_membership table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "kitchen_membership" (
        "id" TEXT NOT NULL,
        "kitchen_id" TEXT NOT NULL,
        "customer_id" TEXT NOT NULL,
        "membership_type" kitchen_membership_type_enum NOT NULL,
        "status" kitchen_membership_status_enum NOT NULL DEFAULT 'pending',
        "business_name" TEXT NULL,
        "business_type" TEXT NULL,
        "food_handler_cert_number" TEXT NULL,
        "food_handler_cert_expires" TIMESTAMPTZ NULL,
        "liability_insurance" BOOLEAN NOT NULL DEFAULT false,
        "prepaid_hours_balance" NUMERIC NOT NULL DEFAULT 0,
        "deposit_balance" NUMERIC NOT NULL DEFAULT 0,
        "investment_balance" NUMERIC NOT NULL DEFAULT 0,
        "total_hours_used" NUMERIC NOT NULL DEFAULT 0,
        "hours_this_month" NUMERIC NOT NULL DEFAULT 0,
        "voting_power" NUMERIC NOT NULL DEFAULT 1,
        "roles" JSONB NULL,
        "preferred_times" JSONB NULL,
        "recurring_bookings" JSONB NULL,
        "emergency_contact" JSONB NULL,
        "waiver_signed_at" TIMESTAMPTZ NULL,
        "rules_accepted_at" TIMESTAMPTZ NULL,
        "food_safety_acknowledged_at" TIMESTAMPTZ NULL,
        "joined_at" TIMESTAMPTZ NOT NULL,
        "expires_at" TIMESTAMPTZ NULL,
        "renewed_at" TIMESTAMPTZ NULL,
        "notes" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "kitchen_membership_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "kitchen_membership_kitchen_fk" FOREIGN KEY ("kitchen_id") REFERENCES "kitchen" ("id") ON DELETE CASCADE
      );
    `)

    // Create kitchen_membership indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_membership_kitchen" ON "kitchen_membership" ("kitchen_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_membership_customer" ON "kitchen_membership" ("customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_membership_status" ON "kitchen_membership" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_membership_type" ON "kitchen_membership" ("membership_type") WHERE "deleted_at" IS NULL;`)

    // Create kitchen_equipment table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "kitchen_equipment" (
        "id" TEXT NOT NULL,
        "kitchen_id" TEXT NOT NULL,
        "space_id" TEXT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NULL,
        "manufacturer" TEXT NULL,
        "model_number" TEXT NULL,
        "serial_number" TEXT NULL,
        "category" kitchen_equipment_category_enum NOT NULL,
        "status" kitchen_equipment_status_enum NOT NULL DEFAULT 'operational',
        "purchase_date" TIMESTAMPTZ NULL,
        "purchase_price" NUMERIC NULL,
        "current_value" NUMERIC NULL,
        "warranty_expires" TIMESTAMPTZ NULL,
        "last_service_date" TIMESTAMPTZ NULL,
        "next_service_due" TIMESTAMPTZ NULL,
        "service_interval_days" INTEGER NULL,
        "maintenance_notes" TEXT NULL,
        "requires_training" BOOLEAN NOT NULL DEFAULT false,
        "training_materials_url" TEXT NULL,
        "authorized_users" JSONB NULL,
        "safety_certifications" JSONB NULL,
        "safety_notes" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "kitchen_equipment_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "kitchen_equipment_kitchen_fk" FOREIGN KEY ("kitchen_id") REFERENCES "kitchen" ("id") ON DELETE CASCADE,
        CONSTRAINT "kitchen_equipment_space_fk" FOREIGN KEY ("space_id") REFERENCES "kitchen_space" ("id") ON DELETE SET NULL
      );
    `)

    // Create kitchen_equipment indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_equipment_kitchen" ON "kitchen_equipment" ("kitchen_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_equipment_space" ON "kitchen_equipment" ("space_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_equipment_category" ON "kitchen_equipment" ("category") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_kitchen_equipment_status" ON "kitchen_equipment" ("status") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "kitchen_equipment" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "kitchen_membership" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "kitchen_space" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "kitchen" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "kitchen_equipment_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_equipment_category_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_membership_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_membership_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_space_assignment_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_space_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_space_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_governance_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "kitchen_type_enum";')
  }
}
