import { Migration } from "@mikro-orm/migrations"

export class Migration20260207CreateBargaining extends Migration {
  async up(): Promise<void> {
    // ── Enums ───────────────────────────────────────────────────────────
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_group_status_enum" AS ENUM (
          'FORMING','OPEN','NEGOTIATING','TERMS_AGREED','COMPLETED','DISBANDED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "voting_rule_enum" AS ENUM (
          'ONE_MEMBER_ONE_VOTE','WEIGHTED_BY_QUANTITY','SUPERMAJORITY','SIMPLE_MAJORITY'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_member_role_enum" AS ENUM ('ORGANIZER','NEGOTIATOR','MEMBER','OBSERVER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_member_status_enum" AS ENUM ('ACTIVE','LEFT','REMOVED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_proposal_status_enum" AS ENUM (
          'DRAFT','SUBMITTED','UNDER_REVIEW','COUNTER_OFFERED',
          'VOTED_ON','ACCEPTED','REJECTED','EXPIRED'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_proposal_type_enum" AS ENUM (
          'SUPPLIER_OFFER','BUYER_COUNTER','SPEC_CHANGE','TERMS_AMENDMENT'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_vote_enum" AS ENUM ('FOR','AGAINST','ABSTAIN');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "bargaining_organizer_type_enum" AS ENUM ('CUSTOMER','SELLER');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "negotiation_msg_type_enum" AS ENUM ('COMMENT','COUNTER','QUESTION','UPDATE','SYSTEM');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)

    // ── bargaining_group ────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "bargaining_group" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NULL,
        "category" TEXT NULL,
        "organizer_id" TEXT NOT NULL,
        "organizer_type" bargaining_organizer_type_enum NOT NULL DEFAULT 'CUSTOMER',
        "common_requirements" JSONB NULL,
        "delivery_specs" JSONB NULL,
        "payment_terms" JSONB NULL,
        "quality_standards" JSONB NULL,
        "voting_rule" voting_rule_enum NOT NULL DEFAULT 'SIMPLE_MAJORITY',
        "approval_threshold" REAL NOT NULL DEFAULT 51,
        "min_members" INTEGER NOT NULL DEFAULT 2,
        "max_members" INTEGER NULL,
        "status" bargaining_group_status_enum NOT NULL DEFAULT 'FORMING',
        "member_count" INTEGER NOT NULL DEFAULT 0,
        "total_quantity" INTEGER NOT NULL DEFAULT 0,
        "total_budget" NUMERIC NOT NULL DEFAULT 0,
        "currency_code" TEXT NOT NULL DEFAULT 'USD',
        "demand_post_id" TEXT NULL,
        "buyer_network_id" TEXT NULL,
        "negotiation_deadline" TIMESTAMPTZ NULL,
        "formed_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "bargaining_group_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bgroup_status" ON "bargaining_group" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bgroup_organizer" ON "bargaining_group" ("organizer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bgroup_category" ON "bargaining_group" ("category") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bgroup_demand_post" ON "bargaining_group" ("demand_post_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bgroup_network" ON "bargaining_group" ("buyer_network_id") WHERE "deleted_at" IS NULL;`)

    // ── bargaining_member ───────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "bargaining_member" (
        "id" TEXT NOT NULL,
        "group_id" TEXT NOT NULL,
        "customer_id" TEXT NOT NULL,
        "role" bargaining_member_role_enum NOT NULL DEFAULT 'MEMBER',
        "status" bargaining_member_status_enum NOT NULL DEFAULT 'ACTIVE',
        "quantity_needed" INTEGER NOT NULL DEFAULT 0,
        "budget" NUMERIC NOT NULL DEFAULT 0,
        "specific_requirements" JSONB NULL,
        "vote_weight" REAL NOT NULL DEFAULT 1,
        "joined_at" TIMESTAMPTZ NOT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "bargaining_member_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bmember_group" ON "bargaining_member" ("group_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bmember_customer" ON "bargaining_member" ("customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_bmember_group_customer" ON "bargaining_member" ("group_id", "customer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bmember_role" ON "bargaining_member" ("role") WHERE "deleted_at" IS NULL;`)

    // ── bargaining_proposal ─────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "bargaining_proposal" (
        "id" TEXT NOT NULL,
        "group_id" TEXT NOT NULL,
        "proposer_id" TEXT NOT NULL,
        "proposer_type" bargaining_organizer_type_enum NOT NULL DEFAULT 'SELLER',
        "proposal_type" bargaining_proposal_type_enum NOT NULL DEFAULT 'SUPPLIER_OFFER',
        "title" TEXT NOT NULL,
        "description" TEXT NULL,
        "terms" JSONB NOT NULL,
        "unit_price" NUMERIC NULL,
        "total_price" NUMERIC NULL,
        "volume_tiers" JSONB NULL,
        "fulfillment_timeline" TEXT NULL,
        "valid_until" TIMESTAMPTZ NULL,
        "parent_proposal_id" TEXT NULL,
        "counter_terms" JSONB NULL,
        "votes_for" INTEGER NOT NULL DEFAULT 0,
        "votes_against" INTEGER NOT NULL DEFAULT 0,
        "votes_abstain" INTEGER NOT NULL DEFAULT 0,
        "total_vote_weight" REAL NOT NULL DEFAULT 0,
        "approval_percentage" REAL NULL,
        "status" bargaining_proposal_status_enum NOT NULL DEFAULT 'DRAFT',
        "submitted_at" TIMESTAMPTZ NULL,
        "voted_at" TIMESTAMPTZ NULL,
        "resolved_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "bargaining_proposal_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bproposal_group" ON "bargaining_proposal" ("group_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bproposal_proposer" ON "bargaining_proposal" ("proposer_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bproposal_status" ON "bargaining_proposal" ("status") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bproposal_parent" ON "bargaining_proposal" ("parent_proposal_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bproposal_type" ON "bargaining_proposal" ("proposal_type") WHERE "deleted_at" IS NULL;`)

    // ── bargaining_vote ─────────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "bargaining_vote" (
        "id" TEXT NOT NULL,
        "proposal_id" TEXT NOT NULL,
        "group_id" TEXT NOT NULL,
        "voter_id" TEXT NOT NULL,
        "vote" bargaining_vote_enum NOT NULL,
        "weight" REAL NOT NULL DEFAULT 1,
        "comment" TEXT NULL,
        "voted_at" TIMESTAMPTZ NOT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "bargaining_vote_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bvote_proposal" ON "bargaining_vote" ("proposal_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bvote_voter" ON "bargaining_vote" ("voter_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_bvote_proposal_voter" ON "bargaining_vote" ("proposal_id", "voter_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_bvote_group" ON "bargaining_vote" ("group_id") WHERE "deleted_at" IS NULL;`)

    // ── negotiation_thread ──────────────────────────────────────────────
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "negotiation_thread" (
        "id" TEXT NOT NULL,
        "group_id" TEXT NOT NULL,
        "proposal_id" TEXT NULL,
        "author_id" TEXT NOT NULL,
        "author_type" bargaining_organizer_type_enum NOT NULL DEFAULT 'CUSTOMER',
        "message" TEXT NOT NULL,
        "message_type" negotiation_msg_type_enum NOT NULL DEFAULT 'COMMENT',
        "parent_message_id" TEXT NULL,
        "attachment_urls" JSONB NULL,
        "posted_at" TIMESTAMPTZ NOT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "negotiation_thread_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nthread_group" ON "negotiation_thread" ("group_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nthread_proposal" ON "negotiation_thread" ("proposal_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nthread_author" ON "negotiation_thread" ("author_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_nthread_parent" ON "negotiation_thread" ("parent_message_id") WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "negotiation_thread" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "bargaining_vote" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "bargaining_proposal" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "bargaining_member" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "bargaining_group" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "negotiation_msg_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_vote_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_proposal_type_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_proposal_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_member_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_member_role_enum";')
    this.addSql('DROP TYPE IF EXISTS "voting_rule_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_group_status_enum";')
    this.addSql('DROP TYPE IF EXISTS "bargaining_organizer_type_enum";')
  }
}
