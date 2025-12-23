import { MigrationInterface, QueryRunner } from "@medusajs/medusa/dist/utils/migration";

export class Migration20241213160023 implements MigrationInterface {
  name = "Migration20241213160023";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_deleted_at" 
      ON "digital_product" (deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_media_deleted_at" 
      ON "digital_product_media" (deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_order_deleted_at" 
      ON "digital_product_order" (deleted_at) 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      DROP CONSTRAINT IF EXISTS "digitalproduct_digitalproductorders_pkey";
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      ADD CONSTRAINT "digitalproduct_digitalproductorders_pkey" 
      PRIMARY KEY ("digital_product_order_id", "digital_product_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_digital_product_deleted_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_digital_product_media_deleted_at";`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_digital_product_order_deleted_at";`);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      DROP CONSTRAINT IF EXISTS "digitalproduct_digitalproductorders_pkey";
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      ADD CONSTRAINT "digitalproduct_digitalproductorders_pkey" 
      PRIMARY KEY ("digital_product_id", "digital_product_order_id");
    `);
  }
}
