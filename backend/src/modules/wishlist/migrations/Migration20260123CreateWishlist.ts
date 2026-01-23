import { Migration } from "@medusajs/framework/mikro-orm/migrations"

export class Migration20260123CreateWishlist extends Migration {

  async up(): Promise<void> {
    // Create shopper_wishlist table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "shopper_wishlist" (
        "id" TEXT NOT NULL,
        "customer_id" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "shopper_wishlist_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create unique index on customer_id (each customer can have only one wishlist)
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_shopper_wishlist_customer_id" ON "shopper_wishlist" (customer_id) WHERE deleted_at IS NULL;`)

    // Create shopper_wishlist_item table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "shopper_wishlist_item" (
        "id" TEXT NOT NULL,
        "product_id" TEXT NOT NULL,
        "wishlist_id" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "shopper_wishlist_item_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "shopper_wishlist_item_wishlist_id_foreign"
          FOREIGN KEY ("wishlist_id")
          REFERENCES "shopper_wishlist" ("id")
          ON UPDATE CASCADE
          ON DELETE CASCADE
      );
    `)

    // Create unique index on (product_id, wishlist_id) to prevent duplicate entries
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_shopper_wishlist_item_product_wishlist" ON "shopper_wishlist_item" (product_id, wishlist_id) WHERE deleted_at IS NULL;`)

    // Create index on wishlist_id for efficient joins
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_shopper_wishlist_item_wishlist_id" ON "shopper_wishlist_item" (wishlist_id) WHERE deleted_at IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "shopper_wishlist_item" CASCADE;')
    this.addSql('DROP TABLE IF EXISTS "shopper_wishlist" CASCADE;')
  }
}
