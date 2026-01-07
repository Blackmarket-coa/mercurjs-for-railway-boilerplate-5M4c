import { Migration } from "@mikro-orm/migrations"

/**
 * Migration to fix vendor_type enum values and add missing columns
 *
 * Issues fixed:
 * 1. Enum values were uppercase (FARM, RETAIL) but model expects lowercase (producer, garden)
 * 2. Missing columns: social_links, storefront_links, website_url
 */
export class Migration20260107FixVendorTypeEnum extends Migration {
  async up(): Promise<void> {
    // Add missing columns first
    this.addSql(`
      ALTER TABLE "seller_metadata"
      ADD COLUMN IF NOT EXISTS "social_links" JSONB NULL,
      ADD COLUMN IF NOT EXISTS "storefront_links" JSONB NULL,
      ADD COLUMN IF NOT EXISTS "website_url" TEXT NULL;
    `)

    // Drop the old enum constraint and recreate with correct values
    // First, alter column to text temporarily
    this.addSql(`
      ALTER TABLE "seller_metadata"
      ALTER COLUMN "vendor_type" TYPE TEXT;
    `)

    // Drop the old enum type
    this.addSql(`
      DROP TYPE IF EXISTS "vendor_type_enum";
    `)

    // Create new enum with correct lowercase values matching the TypeScript model
    this.addSql(`
      CREATE TYPE "vendor_type_enum" AS ENUM (
        'producer',
        'garden',
        'maker',
        'restaurant',
        'mutual_aid'
      );
    `)

    // Map old values to new values
    // FARM -> producer, RESTAURANT -> restaurant, RETAIL -> maker, CREATOR -> maker, DISTRIBUTOR -> producer
    this.addSql(`
      UPDATE "seller_metadata"
      SET "vendor_type" = CASE
        WHEN UPPER("vendor_type") = 'FARM' THEN 'producer'
        WHEN UPPER("vendor_type") = 'RESTAURANT' THEN 'restaurant'
        WHEN UPPER("vendor_type") = 'RETAIL' THEN 'maker'
        WHEN UPPER("vendor_type") = 'CREATOR' THEN 'maker'
        WHEN UPPER("vendor_type") = 'DISTRIBUTOR' THEN 'producer'
        ELSE 'producer'
      END;
    `)

    // Convert column to use new enum
    this.addSql(`
      ALTER TABLE "seller_metadata"
      ALTER COLUMN "vendor_type" TYPE vendor_type_enum
      USING "vendor_type"::vendor_type_enum,
      ALTER COLUMN "vendor_type" SET DEFAULT 'producer';
    `)
  }

  async down(): Promise<void> {
    // Revert to old enum structure
    this.addSql(`
      ALTER TABLE "seller_metadata"
      ALTER COLUMN "vendor_type" TYPE TEXT;
    `)

    this.addSql(`
      DROP TYPE IF EXISTS "vendor_type_enum";
    `)

    this.addSql(`
      CREATE TYPE "vendor_type_enum" AS ENUM ('FARM', 'RESTAURANT', 'DISTRIBUTOR', 'CREATOR', 'RETAIL');
    `)

    this.addSql(`
      UPDATE "seller_metadata"
      SET "vendor_type" = CASE
        WHEN "vendor_type" = 'producer' THEN 'FARM'
        WHEN "vendor_type" = 'restaurant' THEN 'RESTAURANT'
        WHEN "vendor_type" = 'maker' THEN 'RETAIL'
        WHEN "vendor_type" = 'garden' THEN 'FARM'
        WHEN "vendor_type" = 'mutual_aid' THEN 'RETAIL'
        ELSE 'RETAIL'
      END;
    `)

    this.addSql(`
      ALTER TABLE "seller_metadata"
      ALTER COLUMN "vendor_type" TYPE vendor_type_enum
      USING "vendor_type"::vendor_type_enum,
      ALTER COLUMN "vendor_type" SET DEFAULT 'RETAIL';
    `)

    // Remove added columns
    this.addSql(`
      ALTER TABLE "seller_metadata"
      DROP COLUMN IF EXISTS "social_links",
      DROP COLUMN IF EXISTS "storefront_links",
      DROP COLUMN IF EXISTS "website_url";
    `)
  }
}
