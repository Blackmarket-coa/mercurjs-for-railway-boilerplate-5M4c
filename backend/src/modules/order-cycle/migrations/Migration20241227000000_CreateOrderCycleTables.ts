import { Migration } from "@medusajs/framework/mikro-orm"

/**
 * Migration: Create Order Cycle Tables
 * 
 * Run: npx medusa db:migrate
 * 
 * Creates:
 * - order_cycle: Main order cycle table
 * - order_cycle_product: Links products to cycles with overrides
 * - order_cycle_seller: Links sellers to cycles with roles
 */

export class Migration20241227000000_CreateOrderCycleTables extends Migration {
  async up(): Promise<void> {
    // Create order_cycle table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "order_cycle" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NULL,
        "opens_at" TIMESTAMPTZ NOT NULL,
        "closes_at" TIMESTAMPTZ NOT NULL,
        "dispatch_at" TIMESTAMPTZ NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'draft',
        "coordinator_seller_id" TEXT NOT NULL,
        "is_recurring" BOOLEAN NOT NULL DEFAULT FALSE,
        "recurrence_rule" TEXT NULL,
        "pickup_instructions" TEXT NULL,
        "pickup_location" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "order_cycle_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "order_cycle_status_check" CHECK (
          "status" IN ('draft', 'upcoming', 'open', 'closed', 'dispatched', 'cancelled')
        )
      );
    `)

    // Create indexes for order_cycle
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_STATUS" ON "order_cycle" ("status");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_OPENS_AT" ON "order_cycle" ("opens_at");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_CLOSES_AT" ON "order_cycle" ("closes_at");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_ORDER_CYCLE_COORDINATOR" ON "order_cycle" ("coordinator_seller_id");`)

    // Create order_cycle_product table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "order_cycle_product" (
        "id" TEXT NOT NULL,
        "order_cycle_id" TEXT NOT NULL,
        "variant_id" TEXT NOT NULL,
        "seller_id" TEXT NOT NULL,
        "available_quantity" INTEGER NULL,
        "sold_quantity" INTEGER NOT NULL DEFAULT 0,
        "price_override" NUMERIC NULL,
        "is_visible" BOOLEAN NOT NULL DEFAULT TRUE,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "order_cycle_product_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "order_cycle_product_order_cycle_fkey" 
          FOREIGN KEY ("order_cycle_id") 
          REFERENCES "order_cycle" ("id") 
          ON DELETE CASCADE
      );
    `)

    // Create indexes for order_cycle_product
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_ORDER_CYCLE_ID" ON "order_cycle_product" ("order_cycle_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_VARIANT_ID" ON "order_cycle_product" ("variant_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_SELLER_ID" ON "order_cycle_product" ("seller_id");`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_OCP_CYCLE_VARIANT" ON "order_cycle_product" ("order_cycle_id", "variant_id");`)

    // Create order_cycle_seller table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "order_cycle_seller" (
        "id" TEXT NOT NULL,
        "order_cycle_id" TEXT NOT NULL,
        "seller_id" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'producer',
        "commission_rate" REAL NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
        "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "order_cycle_seller_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "order_cycle_seller_order_cycle_fkey" 
          FOREIGN KEY ("order_cycle_id") 
          REFERENCES "order_cycle" ("id") 
          ON DELETE CASCADE,
        CONSTRAINT "order_cycle_seller_role_check" CHECK (
          "role" IN ('coordinator', 'producer', 'hub')
        )
      );
    `)

    // Create indexes for order_cycle_seller
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCS_ORDER_CYCLE_ID" ON "order_cycle_seller" ("order_cycle_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCS_SELLER_ID" ON "order_cycle_seller" ("seller_id");`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_OCS_CYCLE_SELLER" ON "order_cycle_seller" ("order_cycle_id", "seller_id");`)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "order_cycle_seller" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "order_cycle_product" CASCADE;`)
    this.addSql(`DROP TABLE IF EXISTS "order_cycle" CASCADE;`)
  }
}
