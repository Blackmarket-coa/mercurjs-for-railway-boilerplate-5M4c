import { Migration } from "@mikro-orm/migrations"

export class Migration20251228CreateProducer extends Migration {
  async up(): Promise<void> {
    // Create producer table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "producer" (
        "id" TEXT NOT NULL,
        "seller_id" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "description" TEXT NULL,
        "region" TEXT NULL,
        "state" TEXT NULL,
        "country_code" TEXT NULL,
        "latitude" REAL NULL,
        "longitude" REAL NULL,
        "farm_size_acres" REAL NULL,
        "year_established" INTEGER NULL,
        "practices" JSONB NULL,
        "certifications" JSONB NULL,
        "story" TEXT NULL,
        "photo" TEXT NULL,
        "cover_image" TEXT NULL,
        "gallery" JSONB NULL,
        "website" TEXT NULL,
        "social_links" JSONB NULL,
        "public_profile_enabled" BOOLEAN NOT NULL DEFAULT true,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "verified" BOOLEAN NOT NULL DEFAULT false,
        "verified_at" TIMESTAMPTZ NULL,
        "metadata" JSONB NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ NULL,
        CONSTRAINT "producer_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create indexes
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_seller_id" ON "producer" ("seller_id") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_handle" ON "producer" ("handle") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_region" ON "producer" ("region") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_public" ON "producer" ("public_profile_enabled") WHERE "deleted_at" IS NULL;`)
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_featured" ON "producer" ("featured") WHERE "deleted_at" IS NULL;`)
    
    // Full-text search index on name
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_producer_name_search" ON "producer" USING gin(to_tsvector('english', "name")) WHERE "deleted_at" IS NULL;`)
  }

  async down(): Promise<void> {
    this.addSql('DROP TABLE IF EXISTS "producer" CASCADE;')
  }
}
