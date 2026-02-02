import { Migration } from "@mikro-orm/migrations"

/**
 * Add community-aligned product archetype enum values.
 *
 * IMPORTANT: PostgreSQL requires enum values to be committed before they can be used.
 * The data seeding is done in a separate migration (Migration20260202001SeedCommunityArchetypes).
 *
 * No drop-shipping: all fulfillment is community-internal.
 */
export class Migration20260202000AddCommunityArchetypeEnums extends Migration {
  isTransactional(): boolean {
    return false
  }

  async up(): Promise<void> {
    // Add new enum values to product_archetype_code_enum
    // These must be committed before they can be used in INSERT statements
    this.addSql(`
      DO $$ BEGIN
        ALTER TYPE "product_archetype_code_enum" ADD VALUE IF NOT EXISTS 'LAND_ACCESS';
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    this.addSql(`
      DO $$ BEGIN
        ALTER TYPE "product_archetype_code_enum" ADD VALUE IF NOT EXISTS 'MUTUAL_AID';
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    this.addSql(`
      DO $$ BEGIN
        ALTER TYPE "product_archetype_code_enum" ADD VALUE IF NOT EXISTS 'CIRCULAR_ECONOMY';
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    this.addSql(`
      DO $$ BEGIN
        ALTER TYPE "product_archetype_code_enum" ADD VALUE IF NOT EXISTS 'COMMUNITY_SERVICE';
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
    this.addSql(`
      DO $$ BEGIN
        ALTER TYPE "product_archetype_code_enum" ADD VALUE IF NOT EXISTS 'EXPERIMENTAL';
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `)
  }

  async down(): Promise<void> {
    // Enum values cannot be removed in PostgreSQL without recreating the type
    // This is intentionally a no-op
  }
}
