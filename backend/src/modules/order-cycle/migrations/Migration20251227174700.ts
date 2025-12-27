import { Migration } from "@mikro-orm/migrations"

export class Migration20251227174700 extends Migration {
  async up(): Promise<void> {
    // Create enterprise_fee table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "enterprise_fee" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT NULL,
        "seller_id" TEXT NOT NULL,
        "fee_type" TEXT CHECK ("fee_type" IN ('admin', 'packing', 'transport', 'fundraising', 'sales', 'coordinator')) NOT NULL,
        "calculator_type" TEXT CHECK ("calculator_type" IN ('flat_rate', 'flat_per_item', 'percentage', 'weight')) NOT NULL,
        "amount" NUMERIC NOT NULL,
        "currency_code" TEXT NOT NULL DEFAULT 'usd',
        "tax_category_id" TEXT NULL,
        "inherits_tax_category" BOOLEAN NOT NULL DEFAULT true,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "enterprise_fee_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_EF_SELLER_ID" ON "enterprise_fee" ("seller_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_EF_FEE_TYPE" ON "enterprise_fee" ("fee_type");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_EF_ACTIVE" ON "enterprise_fee" ("is_active");`)

    // Create order_cycle_exchange table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "order_cycle_exchange" (
        "id" TEXT NOT NULL,
        "order_cycle_id" TEXT NOT NULL,
        "exchange_type" TEXT CHECK ("exchange_type" IN ('incoming', 'outgoing')) NOT NULL,
        "seller_id" TEXT NOT NULL,
        "receiver_id" TEXT NULL,
        "pickup_time" TEXT NULL,
        "pickup_instructions" TEXT NULL,
        "ready_at" TIMESTAMPTZ NULL,
        "tags" JSONB NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "order_cycle_exchange_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCE_ORDER_CYCLE_ID" ON "order_cycle_exchange" ("order_cycle_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCE_EXCHANGE_TYPE" ON "order_cycle_exchange" ("exchange_type");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCE_SELLER_ID" ON "order_cycle_exchange" ("seller_id");`)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_OCE_CYCLE_TYPE_SELLER" ON "order_cycle_exchange" ("order_cycle_id", "exchange_type", "seller_id");`)

    // Create order_cycle_fee table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "order_cycle_fee" (
        "id" TEXT NOT NULL,
        "order_cycle_id" TEXT NOT NULL,
        "enterprise_fee_id" TEXT NOT NULL,
        "application_type" TEXT CHECK ("application_type" IN ('coordinator', 'incoming', 'outgoing')) NOT NULL,
        "target_seller_id" TEXT NULL,
        "display_order" INTEGER NOT NULL DEFAULT 0,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "order_cycle_fee_pkey" PRIMARY KEY ("id")
      );
    `)

    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCF_ORDER_CYCLE_ID" ON "order_cycle_fee" ("order_cycle_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCF_ENTERPRISE_FEE_ID" ON "order_cycle_fee" ("enterprise_fee_id");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCF_APPLICATION_TYPE" ON "order_cycle_fee" ("application_type");`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCF_TARGET_SELLER" ON "order_cycle_fee" ("target_seller_id");`)

    // Add exchange_id column to order_cycle_product
    this.addSql(`ALTER TABLE "order_cycle_product" ADD COLUMN IF NOT EXISTS "exchange_id" TEXT NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_OCP_EXCHANGE_ID" ON "order_cycle_product" ("exchange_id");`)

    // Rename price_override to override_price if exists
    this.addSql(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_cycle_product' AND column_name = 'price_override') THEN
          ALTER TABLE "order_cycle_product" RENAME COLUMN "price_override" TO "override_price";
        END IF;
      END $$;
    `)

    // Add ready_for_text column to order_cycle
    this.addSql(`ALTER TABLE "order_cycle" ADD COLUMN IF NOT EXISTS "ready_for_text" TEXT NULL;`)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "order_cycle_fee";`)
    this.addSql(`DROP TABLE IF EXISTS "order_cycle_exchange";`)
    this.addSql(`DROP TABLE IF EXISTS "enterprise_fee";`)
    this.addSql(`ALTER TABLE "order_cycle_product" DROP COLUMN IF EXISTS "exchange_id";`)
    this.addSql(`ALTER TABLE "order_cycle" DROP COLUMN IF EXISTS "ready_for_text";`)
  }
}
