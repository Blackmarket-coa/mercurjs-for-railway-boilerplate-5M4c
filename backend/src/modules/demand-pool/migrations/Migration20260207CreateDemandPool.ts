import { Migration } from "@mikro-orm/migrations"

export class Migration20260207CreateDemandPool extends Migration {
  async up(): Promise<void> {
    // ── Enums ───────────────────────────────────────────────────────────
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "demand_post_status_enum" AS ENUM (
          'DRAFT','OPEN','THRESHOLD_MET','NEGOTIATING',
          'DEAL_APPROVED','ORDER_PLACED','FULFILLED','CANCELLED','EXPIRED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "demand_post_visibility_enum" AS ENUM ('PUBLIC','NETWORK_ONLY','INVITE_ONLY');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "demand_creator_type_enum" AS ENUM ('CUSTOMER','SELLER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "participant_status_enum" AS ENUM ('COMMITTED','ESCROWED','CONFIRMED','WITHDRAWN','REFUNDED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bounty_objective_enum" AS ENUM (
          'FIND_SUPPLIER','NEGOTIATE_PRICE','RECRUIT_BUYERS',
          'COORDINATE_LOGISTICS','FINALIZE_DEAL'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bounty_status_enum" AS ENUM ('ACTIVE','MILESTONE_PARTIAL','COMPLETED','CANCELLED','EXPIRED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bounty_visibility_enum" AS ENUM ('PUBLIC','RESTRICTED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "supplier_proposal_status_enum" AS ENUM (
          'SUBMITTED','UNDER_REVIEW','SHORTLISTED','COUNTER_OFFERED',
          'ACCEPTED','REJECTED','WITHDRAWN'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "proposal_vote_enum" AS ENUM ('FOR','AGAINST','ABSTAIN');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bounty_assignee_type_enum" AS ENUM ('CUSTOMER','SELLER','ORGANIZER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "demand_deadline_type_enum" AS ENUM ('HARD','SOFT');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // ── demand_post ─────────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "demand_post" (
        "id" TEXT NOT NULL,
        "creator_id" TEXT NOT NULL,
        "creator_type" demand_creator_type_enum NOT NULL DEFAULT 'CUSTOMER',
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NULL,
        "specs" JSONB NULL,
        "target_quantity" INTEGER NOT NULL,
        "min_quantity" INTEGER NOT NULL,
        "committed_quantity" INTEGER NOT NULL DEFAULT 0,
        "unit_of_measure" TEXT NOT NULL DEFAULT 'units',
        "target_price" NUMERIC NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "delivery_region" TEXT NULL,
        "delivery_address" JSONB NULL,
        "delivery_window_start" TIMESTAMPTZ NULL,
        "delivery_window_end" TIMESTAMPTZ NULL,
        "deadline" TIMESTAMPTZ NULL,
        "deadline_type" demand_deadline_type_enum NOT NULL DEFAULT 'SOFT',
        "status" demand_post_status_enum NOT NULL DEFAULT 'DRAFT',
        "visibility" demand_post_visibility_enum NOT NULL DEFAULT 'PUBLIC',
        "total_bounty_amount" NUMERIC NOT NULL DEFAULT 0,
        "total_escrowed" NUMERIC NOT NULL DEFAULT 0,
        "attractiveness_score" REAL NOT NULL DEFAULT 0,
        "selected_supplier_id" TEXT NULL,
        "final_unit_price" NUMERIC NULL,
        "final_total_price" NUMERIC NULL,
        "escrow_account_id" TEXT NULL,
        "parent_demand_id" TEXT NULL,
        "recurring_rule" TEXT NULL,
        "is_template" BOOLEAN NOT NULL DEFAULT false,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "demand_post_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_demand_post_status" ON "demand_post" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_demand_post_creator" ON "demand_post" ("creator_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_demand_post_category" ON "demand_post" ("category") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_demand_post_region" ON "demand_post" ("delivery_region") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_demand_post_visibility_status" ON "demand_post" ("visibility", "status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_demand_post_attractiveness" ON "demand_post" ("attractiveness_score") WHERE "deleted_at" IS NULL;`)

    // ── demand_participant ──────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "demand_participant" (
        "id" TEXT NOT NULL,
        "demand_post_id" TEXT NOT NULL,
        "customer_id" TEXT NOT NULL,
        "quantity_committed" INTEGER NOT NULL,
        "price_willing_to_pay" NUMERIC NULL,
        "escrow_amount" NUMERIC NOT NULL DEFAULT 0,
        "escrow_locked" BOOLEAN NOT NULL DEFAULT false,
        "ledger_entry_id" TEXT NULL,
        "status" participant_status_enum NOT NULL DEFAULT 'COMMITTED',
        "vote_weight" REAL NOT NULL DEFAULT 1,
        "joined_at" TIMESTAMPTZ NOT NULL,
        "escrowed_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "demand_participant_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_participant_demand_post" ON "demand_participant" ("demand_post_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_participant_customer" ON "demand_participant" ("customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_participant_demand_customer" ON "demand_participant" ("demand_post_id", "customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_participant_status" ON "demand_participant" ("status") WHERE "deleted_at" IS NULL;`)

    // ── demand_bounty ───────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "demand_bounty" (
        "id" TEXT NOT NULL,
        "demand_post_id" TEXT NOT NULL,
        "contributor_id" TEXT NOT NULL,
        "contributor_type" demand_creator_type_enum NOT NULL DEFAULT 'CUSTOMER',
        "objective" bounty_objective_enum NOT NULL,
        "amount" NUMERIC NOT NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "escrowed" BOOLEAN NOT NULL DEFAULT false,
        "escrow_ledger_entry_id" TEXT NULL,
        "milestones" JSONB NOT NULL DEFAULT '[]',
        "milestones_completed" INTEGER NOT NULL DEFAULT 0,
        "amount_paid_out" NUMERIC NOT NULL DEFAULT 0,
        "assignee_id" TEXT NULL,
        "assignee_type" bounty_assignee_type_enum NULL,
        "status" bounty_status_enum NOT NULL DEFAULT 'ACTIVE',
        "visibility" bounty_visibility_enum NOT NULL DEFAULT 'PUBLIC',
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "demand_bounty_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bounty_demand_post" ON "demand_bounty" ("demand_post_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bounty_contributor" ON "demand_bounty" ("contributor_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bounty_objective" ON "demand_bounty" ("objective") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bounty_status" ON "demand_bounty" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bounty_assignee" ON "demand_bounty" ("assignee_id") WHERE "deleted_at" IS NULL;`)

    // ── supplier_proposal ───────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "supplier_proposal" (
        "id" TEXT NOT NULL,
        "demand_post_id" TEXT NOT NULL,
        "supplier_id" TEXT NOT NULL,
        "unit_price" NUMERIC NOT NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "min_quantity" INTEGER NOT NULL,
        "max_quantity" INTEGER NULL,
        "volume_tiers" JSONB NULL,
        "fulfillment_timeline_days" INTEGER NULL,
        "delivery_method" TEXT NULL,
        "delivery_cost" NUMERIC NULL,
        "certifications" JSONB NULL,
        "compliance_notes" TEXT NULL,
        "payment_terms" TEXT NULL,
        "notes" TEXT NULL,
        "counter_offer" JSONB NULL,
        "counter_offer_at" TIMESTAMPTZ NULL,
        "votes_for" INTEGER NOT NULL DEFAULT 0,
        "votes_against" INTEGER NOT NULL DEFAULT 0,
        "vote_weight_for" REAL NOT NULL DEFAULT 0,
        "vote_weight_against" REAL NOT NULL DEFAULT 0,
        "status" supplier_proposal_status_enum NOT NULL DEFAULT 'SUBMITTED',
        "submitted_at" TIMESTAMPTZ NOT NULL,
        "reviewed_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "supplier_proposal_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_proposal_demand_post" ON "supplier_proposal" ("demand_post_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_proposal_supplier" ON "supplier_proposal" ("supplier_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_proposal_status" ON "supplier_proposal" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_proposal_demand_supplier" ON "supplier_proposal" ("demand_post_id", "supplier_id") WHERE "deleted_at" IS NULL;`)

    // ── proposal_vote ───────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "proposal_vote" (
        "id" TEXT NOT NULL,
        "proposal_id" TEXT NOT NULL,
        "demand_post_id" TEXT NOT NULL,
        "voter_id" TEXT NOT NULL,
        "vote" proposal_vote_enum NOT NULL,
        "weight" REAL NOT NULL DEFAULT 1,
        "comment" TEXT NULL,
        "voted_at" TIMESTAMPTZ NOT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "proposal_vote_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pvote_proposal" ON "proposal_vote" ("proposal_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_pvote_voter" ON "proposal_vote" ("voter_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_pvote_proposal_voter" ON "proposal_vote" ("proposal_id", "voter_id") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "proposal_vote" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "supplier_proposal" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "demand_bounty" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "demand_participant" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "demand_post" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "proposal_vote_enum";')
    this.addSql('DROP TYPE IF EXISTS "supplier_proposal_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "bounty_visibility_enum";')
    this.addSql('DROP TYPE IF EXISTS "bounty_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "bounty_objective_enum";')
    this.addSql('DROP TYPE IF EXISTS "bounty_assignee_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "participant_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "demand_post_visibility_enum";')
    this.addSql('DROP TYPE IF EXISTS "demand_post_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "demand_creator_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "demand_deadline_type_enum";')
  }
}
