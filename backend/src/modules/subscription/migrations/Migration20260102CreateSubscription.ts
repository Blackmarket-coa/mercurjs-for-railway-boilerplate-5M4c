import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260102CreateSubscription extends Migration {

  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "subscription" (
        "id" TEXT NOT NULL,
        "status" TEXT CHECK ("status" IN ('active', 'paused', 'canceled', 'expired', 'failed')) NOT NULL DEFAULT 'active',
        "type" TEXT CHECK ("type" IN ('csa_share', 'meal_plan', 'produce_box', 'membership', 'custom')) NOT NULL DEFAULT 'custom',
        "interval" TEXT CHECK ("interval" IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')) NOT NULL,
        "period" INTEGER NOT NULL,
        "seller_id" TEXT NULL,
        "customer_id" TEXT NULL,
        "product_id" TEXT NULL,
        "variant_id" TEXT NULL,
        "quantity" INTEGER NOT NULL DEFAULT 1,
        "subscription_date" TIMESTAMPTZ NOT NULL,
        "last_order_date" TIMESTAMPTZ NOT NULL,
        "next_order_date" TIMESTAMPTZ NULL,
        "expiration_date" TIMESTAMPTZ NOT NULL,
        "paused_at" TIMESTAMPTZ NULL,
        "canceled_at" TIMESTAMPTZ NULL,
        "stripe_subscription_id" TEXT NULL,
        "payment_method_id" TEXT NULL,
        "delivery_day" TEXT NULL,
        "delivery_instructions" TEXT NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
      );
    `)

    // Indexes for efficient queries
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_next_order_date" ON "subscription" (next_order_date) WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_expiration_date" ON "subscription" (expiration_date) WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_status" ON "subscription" (status) WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_customer_id" ON "subscription" (customer_id) WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_seller_id" ON "subscription" (seller_id) WHERE deleted_at IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_subscription_product_id" ON "subscription" (product_id) WHERE deleted_at IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "subscription" CASCADE;')
  }
}
