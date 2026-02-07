import { Migration } from "@mikro-orm/migrations"

/**
 * Migration: Add enabled_extensions column to seller_metadata
 *
 * This column stores a JSON array of feature keys that the vendor
 * has chosen to enable on their dashboard. When null, the vendor
 * uses the default extensions for their vendor type.
 *
 * Example value: ["hasProducts", "hasVolunteers", "hasMenu"]
 */
export class Migration20260207AddEnabledExtensions extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      ALTER TABLE "seller_metadata"
      ADD COLUMN IF NOT EXISTS "enabled_extensions" jsonb DEFAULT NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql(`
      ALTER TABLE "seller_metadata"
      DROP COLUMN IF EXISTS "enabled_extensions";
    `)
  }
}
