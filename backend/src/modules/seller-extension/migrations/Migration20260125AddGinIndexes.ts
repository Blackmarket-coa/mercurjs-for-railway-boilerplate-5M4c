import { Migration } from "@mikro-orm/migrations"

/**
 * Migration: Add GIN indexes for JSONB fields
 *
 * GIN (Generalized Inverted Index) indexes significantly improve
 * query performance on JSONB columns, especially for:
 * - Containment queries (@>, <@)
 * - Key existence queries (?)
 * - Key-value searches
 *
 * This enables efficient filtering by certifications, social links, etc.
 */
export class Migration20260125AddGinIndexes extends Migration {
  async up(): Promise<void> {
    // GIN index on certifications - enables queries like:
    // WHERE certifications @> '[{"name": "USDA Organic"}]'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_certifications_gin"
      ON "seller_metadata" USING GIN ("certifications")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on social_links - enables queries like:
    // WHERE social_links ? 'instagram'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_social_links_gin"
      ON "seller_metadata" USING GIN ("social_links")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on storefront_links - enables queries like:
    // WHERE storefront_links ? 'etsy'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_storefront_links_gin"
      ON "seller_metadata" USING GIN ("storefront_links")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on farm_practices - enables queries like:
    // WHERE farm_practices @> '{"organic": true}'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_farm_practices_gin"
      ON "seller_metadata" USING GIN ("farm_practices")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on cuisine_types - enables queries like:
    // WHERE cuisine_types @> '["Mexican"]'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_cuisine_types_gin"
      ON "seller_metadata" USING GIN ("cuisine_types")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on service_types - enables queries like:
    // WHERE service_types @> '["delivery"]'
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_service_types_gin"
      ON "seller_metadata" USING GIN ("service_types")
      WHERE "deleted_at" IS NULL;
    `)

    // GIN index on metadata - enables extensible queries
    this.addSql(`
      CREATE INDEX IF NOT EXISTS "IDX_seller_metadata_metadata_gin"
      ON "seller_metadata" USING GIN ("metadata")
      WHERE "deleted_at" IS NULL;
    `)
  }

  async down(): Promise<void> {
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_certifications_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_social_links_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_storefront_links_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_farm_practices_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_cuisine_types_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_service_types_gin";')
    this.addSql('DROP INDEX IF EXISTS "IDX_seller_metadata_metadata_gin";')
  }
}
