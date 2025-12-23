import { MigrationInterface, QueryRunner } from "@medusajs/medusa/dist/utils/migration";

export class Migration20240917093019 implements MigrationInterface {
  name = "Migration20240917093019";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "digital_product" (
        "id" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "digital_product_pkey" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "digital_product_media" (
        "id" TEXT NOT NULL,
        "type" TEXT CHECK ("type" IN ('main', 'preview')) NOT NULL,
        "fileId" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL,
        "digital_product_id" TEXT NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "digital_product_media_pkey" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_digital_product_media_digital_product_id" 
      ON "digital_product_media" ("digital_product_id") 
      WHERE deleted_at IS NULL;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "digital_product_order" (
        "id" TEXT NOT NULL,
        "status" TEXT CHECK ("status" IN ('pending', 'sent')) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "digital_product_order_pkey" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "digitalproduct_digitalproductorders" (
        "digital_product_id" TEXT NOT NULL,
        "digital_product_order_id" TEXT NOT NULL,
        CONSTRAINT "digitalproduct_digitalproductorders_pkey" PRIMARY KEY ("digital_product_id", "digital_product_order_id")
      );
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digital_product_media" 
      ADD CONSTRAINT "digital_product_media_digital_product_id_foreign" 
      FOREIGN KEY ("digital_product_id") REFERENCES "digital_product" ("id") 
      ON UPDATE CASCADE ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      ADD CONSTRAINT "digitalproduct_digitalproductorders_digital_product_id_foreign" 
      FOREIGN KEY ("digital_product_id") REFERENCES "digital_product" ("id") 
      ON UPDATE CASCADE ON DELETE CASCADE;
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      ADD CONSTRAINT "digitalproduct_digitalproductorders_digital_produ_c0c21_foreign" 
      FOREIGN KEY ("digital_product_order_id") REFERENCES "digital_product_order" ("id") 
      ON UPDATE CASCADE ON DELETE CASCADE;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digital_product_media" 
      DROP CONSTRAINT IF EXISTS "digital_product_media_digital_product_id_foreign";
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      DROP CONSTRAINT IF EXISTS "digitalproduct_digitalproductorders_digital_product_id_foreign";
    `);

    await queryRunner.query(`
      ALTER TABLE IF EXISTS "digitalproduct_digitalproductorders" 
      DROP CONSTRAINT IF EXISTS "digitalproduct_digitalproductorders_digital_produ_c0c21_foreign";
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "digital_product_media" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "digitalproduct_digitalproductorders" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "digital_product_order" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "digital_product" CASCADE;`);
  }
}
