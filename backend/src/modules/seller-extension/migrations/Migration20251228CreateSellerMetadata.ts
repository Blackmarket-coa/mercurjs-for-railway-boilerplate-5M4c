import { Migration } from "@mikro-orm/migrations"

export class Migration20251228CreateSellerMetadata extends Migration {
  async up(): Promise<void> {
    // Create vendor_type enum
    this.addSql(`
      DO $$ BEGIN
        CREATE TYPE "vendor_type_enum" AS ENUM ('FARM', 'RESTAURANT', 'DISTRIBUTOR', 'CREATOR', 'RETAIL');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `)

    // Create seller_metadata table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "seller_metadata" (
        "id" TEXT NOT NULL,
        "seller_id" TEXT NOT NULL UNIQUE,
        "vendor_type" vendor_type_enum NOT NULL DEFAULT 'RETAIL',
        "business_registration_number" TEXT NULL,
        "tax_classification" TEXT NULL,
        "farm_practices" JSONB NULL,
        "certifications" JSONB NULL,
        "growing_region" TEXT NULL,
        "cuisine_types" JSONB NULL,
        "service_types" JSONB NULL,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "rating" REAL NULL,
        "review_count" INTEGER NOT NULL DEFAULT 0,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "seller_metadata_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create indexes
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_vendor_type" 
      ON "seller_metadata" ("vendor_type") 
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_featured" 
      ON "seller_metadata" ("featured") 
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_seller_id" 
      ON "seller_metadata" ("seller_id") 
      WHERE "deleted_at" IS NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "seller_metadata" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "vendor_type_enum";')
  }
}
