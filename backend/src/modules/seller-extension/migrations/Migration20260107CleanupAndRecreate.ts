import { Migration } from "@mikro-orm/migrations"

/**
 * Cleanup and recreate seller_metadata with correct schema
 *
 * This migration drops the existing seller_metadata table and enum,
 * then recreates them with the correct structure. This is safe for
 * Railway since we manually applied the schema already, but MikroORM
 * needs to see a clean migration history.
 */
export class Migration20260107CleanupAndRecreate extends Migration {
  async up(): Promise<void> {
    // Drop existing table and enum
    this.addSql('DROP TABLE IF EXISTS "seller_metadata" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "vendor_type_enum" CASCADE;')

    // Recreate enum with correct values
    this.addSql(`
      CREATE TYPE "vendor_type_enum" AS ENUM (
        'producer',
        'garden',
        'maker',
        'restaurant',
        'mutual_aid'
      );
    `)

    // Recreate table with all correct columns
    this.addSql(`
      CREATE TABLE "seller_metadata" (
        "id" TEXT NOT NULL,
        "seller_id" TEXT NOT NULL UNIQUE,
        "vendor_type" vendor_type_enum NOT NULL DEFAULT 'producer',
        "business_registration_number" TEXT NULL,
        "tax_classification" TEXT NULL,
        "social_links" JSONB NULL,
        "storefront_links" JSONB NULL,
        "website_url" TEXT NULL,
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

    // Recreate indexes
    this.addSql(`
      CREATE INDEX "IDX_seller_metadata_vendor_type"
      ON "seller_metadata" ("vendor_type")
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX "IDX_seller_metadata_featured"
      ON "seller_metadata" ("featured")
      WHERE "deleted_at" IS NULL;
    `)

    this.addSql(`
      CREATE INDEX "IDX_seller_metadata_seller_id"
      ON "seller_metadata" ("seller_id")
      WHERE "deleted_at" IS NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "seller_metadata" CASCADE;')
    this.addSql('DROP TYPE IF EXISTS "vendor_type_enum";')
  }
}
