import { Migration } from "@mikro-orm/migrations"

export class Migration20260207CreateBuyerNetwork extends Migration {
  async up(): Promise<void> {
    // ── Enums ───────────────────────────────────────────────────────────
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "buyer_network_type_enum" AS ENUM (
          'INDUSTRY_GROUP','LOCAL_CHAPTER','COOPERATIVE','BUYING_CLUB','TRADE_ASSOCIATION'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "buyer_network_status_enum" AS ENUM ('ACTIVE','INACTIVE','SUSPENDED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "network_member_role_enum" AS ENUM ('ADMIN','MODERATOR','MEMBER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "network_member_status_enum" AS ENUM ('ACTIVE','PENDING','SUSPENDED','LEFT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // ── buyer_network ───────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "buyer_network" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "description" TEXT NULL,
        "network_type" buyer_network_type_enum NOT NULL DEFAULT 'BUYING_CLUB',
        "industry" TEXT NULL,
        "categories" JSONB NULL,
        "region" TEXT NULL,
        "geo_bounds" JSONB NULL,
        "admin_id" TEXT NOT NULL,
        "is_public" BOOLEAN NOT NULL DEFAULT true,
        "requires_approval" BOOLEAN NOT NULL DEFAULT false,
        "min_purchase_commitment" NUMERIC NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "member_count" INTEGER NOT NULL DEFAULT 0,
        "total_savings" NUMERIC NOT NULL DEFAULT 0,
        "completed_group_buys" INTEGER NOT NULL DEFAULT 0,
        "active_demand_posts" INTEGER NOT NULL DEFAULT 0,
        "trust_score" REAL NOT NULL DEFAULT 0,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "status" buyer_network_status_enum NOT NULL DEFAULT 'ACTIVE',
        "preferred_suppliers" JSONB NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "buyer_network_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bnetwork_handle" ON "buyer_network" ("handle") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bnetwork_type" ON "buyer_network" ("network_type") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bnetwork_industry" ON "buyer_network" ("industry") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bnetwork_region" ON "buyer_network" ("region") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bnetwork_status" ON "buyer_network" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bnetwork_admin" ON "buyer_network" ("admin_id") WHERE "deleted_at" IS NULL;`)

    // ── network_member ──────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "network_member" (
        "id" TEXT NOT NULL,
        "network_id" TEXT NOT NULL,
        "customer_id" TEXT NOT NULL,
        "role" network_member_role_enum NOT NULL DEFAULT 'MEMBER',
        "status" network_member_status_enum NOT NULL DEFAULT 'ACTIVE',
        "display_name" TEXT NULL,
        "business_name" TEXT NULL,
        "business_type" TEXT NULL,
        "group_buys_joined" INTEGER NOT NULL DEFAULT 0,
        "total_savings" NUMERIC NOT NULL DEFAULT 0,
        "reputation_score" REAL NOT NULL DEFAULT 0,
        "referral_count" INTEGER NOT NULL DEFAULT 0,
        "reward_points" INTEGER NOT NULL DEFAULT 0,
        "joined_at" TIMESTAMPTZ NOT NULL,
        "approved_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "network_member_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nmember_network" ON "network_member" ("network_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nmember_customer" ON "network_member" ("customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_nmember_network_customer" ON "network_member" ("network_id", "customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nmember_status" ON "network_member" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nmember_reputation" ON "network_member" ("reputation_score") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "network_member" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "buyer_network" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "network_member_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "network_member_role_enum";')
    this.addSql('DROP TYPE IF EXISTS "buyer_network_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "buyer_network_type_enum";')
  }
}
