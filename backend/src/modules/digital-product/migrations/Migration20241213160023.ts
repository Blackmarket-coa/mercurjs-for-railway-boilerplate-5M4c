import { Migration } from "@mikro-orm/migrations"

export class Migration20241213160023 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_deleted_at" 
      ON "digital_product" (deleted_at) 
      WHERE deleted_at IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_media_deleted_at" 
      ON "digital_product_media" (deleted_at) 
      WHERE deleted_at IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_order_deleted_at" 
      ON "digital_product_order" (deleted_at) 
      WHERE deleted_at IS NULL;
    `)

    this.addSql(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      DROP CONSTRAINT IF EXISTS "digitalproduct_digitalproductorders_pkey";
    `)

    this.addSql(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      ADD CONSTRAINT "digitalproduct_digitalproductorders_pkey" 
      PRIMARY KEY ("digital_product_order_id", "digital_product_id");
    `)
  }

  async down(): Promise<void> {
    this.addSql(`DROP INDEX IF EXISTS "IDX_digital_product_deleted_at";`)
    this.addSql(`DROP INDEX IF EXISTS "IDX_digital_product_media_deleted_at";`)
    this.addSql(`DROP INDEX IF EXISTS "IDX_digital_product_order_deleted_at";`)

    this.addSql(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      DROP CONSTRAINT IF EXISTS "digitalproduct_digitalproductorders_pkey";
    `)

    this.addSql(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      ADD CONSTRAINT "digitalproduct_digitalproductorders_pkey" 
      PRIMARY KEY ("digital_product_id", "digital_product_order_id");
    `)
  }
}
