import { Migration } from "@mikro-orm/migrations"

export class Migration20260203CreateGarden extends Migration {
  async up(): Promise<void> {
    // Create enums for garden
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_producer_type_enum" AS ENUM ('community', 'school', 'church', 'cooperative', 'municipal');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_status_enum" AS ENUM ('planning', 'active', 'dormant', 'closed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_governance_enum" AS ENUM ('equal_vote', 'labor_weighted', 'investment_weighted', 'hybrid');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create enums for garden_plot
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_plot_sun_exposure_enum" AS ENUM ('full_sun', 'partial_sun', 'shade');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_plot_assignment_type_enum" AS ENUM ('individual', 'shared', 'communal');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_plot_status_enum" AS ENUM ('available', 'assigned', 'growing', 'fallow', 'maintenance');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_plot_fee_type_enum" AS ENUM ('usd', 'volunteer_hours', 'harvest_share', 'free');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create enums for garden_membership
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_membership_type_enum" AS ENUM ('plot_holder', 'harvest_share', 'volunteer', 'investor', 'patron', 'organizer');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_membership_status_enum" AS ENUM ('pending', 'active', 'suspended', 'expired', 'cancelled');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create enums for garden_soil_zone
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_soil_type_enum" AS ENUM ('clay', 'sandy', 'loam', 'silt', 'peat', 'chalk', 'mixed');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "garden_drainage_enum" AS ENUM ('poor', 'moderate', 'good', 'excellent');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // Create garden table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "garden" (
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
        "producer_type" garden_producer_type_enum NOT NULL,
        "total_plots" INTEGER NOT NULL DEFAULT 0,
        "total_sqft" INTEGER NOT NULL DEFAULT 0,
        "status" garden_status_enum NOT NULL DEFAULT 'planning',
        "current_season_id" TEXT NULL,
        "governance_model" garden_governance_enum NOT NULL DEFAULT 'equal_vote',
        "operating_account_id" TEXT NULL,
        "tool_fund_account_id" TEXT NULL,
        "seed_fund_account_id" TEXT NULL,
        "harvest_pool_account_id" TEXT NULL,
        "volunteer_credit_pool_id" TEXT NULL,
        "investment_pool_account_id" TEXT NULL,
        "settings" JSONB NULL,
        "contact_email" TEXT NULL,
        "contact_phone" TEXT NULL,
        "website" TEXT NULL,
        "cover_image_url" TEXT NULL,
        "gallery_urls" JSONB NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "garden_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create garden indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_slug" ON "garden" ("slug") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_status" ON "garden" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_producer_type" ON "garden" ("producer_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_city" ON "garden" ("city") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_state" ON "garden" ("state") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_managing_org" ON "garden" ("managing_org_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_name_search" ON "garden" USING gin(to_tsvector('english', "name")) WHERE "deleted_at" IS NULL;`)

    // Create garden_soil_zone table (before garden_plot since plots reference soil zones)
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "garden_soil_zone" (
        "id" TEXT NOT NULL,
        "garden_id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "soil_type" garden_soil_type_enum NULL,
        "ph_level" NUMERIC NULL,
        "organic_matter_percent" NUMERIC NULL,
        "drainage" garden_drainage_enum NULL,
        "last_amended_at" TIMESTAMPTZ NULL,
        "amendments_applied" JSONB NULL,
        "last_tested_at" TIMESTAMPTZ NULL,
        "test_results" JSONB NULL,
        "recommended_crops" JSONB NULL,
        "avoid_crops" JSONB NULL,
        "notes" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "garden_soil_zone_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "garden_soil_zone_garden_fk" FOREIGN KEY ("garden_id") REFERENCES "garden" ("id") ON DELETE CASCADE
      );
    `)

    // Create garden_soil_zone indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_soil_zone_garden" ON "garden_soil_zone" ("garden_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_soil_zone_type" ON "garden_soil_zone" ("soil_type") WHERE "deleted_at" IS NULL;`)

    // Create garden_plot table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "garden_plot" (
        "id" TEXT NOT NULL,
        "garden_id" TEXT NOT NULL,
        "plot_number" TEXT NOT NULL,
        "size_sqft" INTEGER NOT NULL,
        "soil_zone_id" TEXT NULL,
        "row" INTEGER NULL,
        "column" INTEGER NULL,
        "section" TEXT NULL,
        "has_water_access" BOOLEAN NOT NULL DEFAULT false,
        "has_raised_bed" BOOLEAN NOT NULL DEFAULT false,
        "is_accessible" BOOLEAN NOT NULL DEFAULT false,
        "sun_exposure" garden_plot_sun_exposure_enum NULL,
        "assigned_to_id" TEXT NULL,
        "assignment_type" garden_plot_assignment_type_enum NOT NULL DEFAULT 'individual',
        "season_id" TEXT NULL,
        "status" garden_plot_status_enum NOT NULL DEFAULT 'available',
        "season_fee" NUMERIC NULL,
        "fee_type" garden_plot_fee_type_enum NOT NULL DEFAULT 'usd',
        "notes" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "garden_plot_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "garden_plot_garden_fk" FOREIGN KEY ("garden_id") REFERENCES "garden" ("id") ON DELETE CASCADE,
        CONSTRAINT "garden_plot_soil_zone_fk" FOREIGN KEY ("soil_zone_id") REFERENCES "garden_soil_zone" ("id") ON DELETE SET NULL
      );
    `)

    // Create garden_plot indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_plot_garden" ON "garden_plot" ("garden_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_plot_soil_zone" ON "garden_plot" ("soil_zone_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_plot_status" ON "garden_plot" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_plot_assigned_to" ON "garden_plot" ("assigned_to_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_plot_season" ON "garden_plot" ("season_id") WHERE "deleted_at" IS NULL;`)

    // Create garden_membership table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "garden_membership" (
        "id" TEXT NOT NULL,
        "garden_id" TEXT NOT NULL,
        "customer_id" TEXT NOT NULL,
        "membership_type" garden_membership_type_enum NOT NULL,
        "status" garden_membership_status_enum NOT NULL DEFAULT 'pending',
        "volunteer_hours_balance" NUMERIC NOT NULL DEFAULT 0,
        "harvest_credits_balance" NUMERIC NOT NULL DEFAULT 0,
        "investment_balance" NUMERIC NOT NULL DEFAULT 0,
        "voting_power" NUMERIC NOT NULL DEFAULT 1,
        "roles" JSONB NULL,
        "season_id" TEXT NULL,
        "assigned_plot_ids" JSONB NULL,
        "volunteer_preferences" JSONB NULL,
        "emergency_contact" JSONB NULL,
        "waiver_signed_at" TIMESTAMPTZ NULL,
        "rules_accepted_at" TIMESTAMPTZ NULL,
        "joined_at" TIMESTAMPTZ NOT NULL,
        "expires_at" TIMESTAMPTZ NULL,
        "renewed_at" TIMESTAMPTZ NULL,
        "notes" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "garden_membership_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "garden_membership_garden_fk" FOREIGN KEY ("garden_id") REFERENCES "garden" ("id") ON DELETE CASCADE
      );
    `)

    // Create garden_membership indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_membership_garden" ON "garden_membership" ("garden_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_membership_customer" ON "garden_membership" ("customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_membership_status" ON "garden_membership" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_membership_type" ON "garden_membership" ("membership_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_garden_membership_season" ON "garden_membership" ("season_id") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "garden_membership" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "garden_plot" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "garden_soil_zone" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "garden" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "garden_drainage_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_soil_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_membership_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_membership_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_plot_fee_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_plot_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_plot_assignment_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_plot_sun_exposure_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_governance_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "garden_producer_type_enum";')
  }
}
