import { Migration } from "@mikro-orm/migrations"

/**
 * Migration: Add GIN indexes for producer JSONB fields
 *
 * Improves query performance for filtering producers by:
 * - Growing practices (organic, regenerative, etc.)
 * - Certifications (USDA Organic, Fair Trade, etc.)
 * - Social links (has Instagram, has website, etc.)
 * - Gallery (future: media search)
 */
export class Migration20260125AddGinIndexes extends Migration {
  async up(): Promise<void> {
    // GIN index on practices - enables queries like:
    // WHERE practices @> '["ORGANIC"]'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_producer_practices_gin"
      ON "producer" USING GIN ("practices")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on certifications - enables queries like:
    // WHERE certifications @> '[{"name": "USDA Organic"}]'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_producer_certifications_gin"
      ON "producer" USING GIN ("certifications")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on social_links - enables queries like:
    // WHERE social_links ? 'instagram'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_producer_social_links_gin"
      ON "producer" USING GIN ("social_links")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on gallery - enables media queries
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_producer_gallery_gin"
      ON "producer" USING GIN ("gallery")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on metadata - enables extensible queries
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_producer_metadata_gin"
      ON "producer" USING GIN ("metadata")
      WHERE "deleted_at" IS NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql('DROP INDEX IF EXISTS "IDX_producer_practices_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_producer_certifications_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_producer_social_links_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_producer_gallery_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_producer_metadata_gin";')
  }
}
