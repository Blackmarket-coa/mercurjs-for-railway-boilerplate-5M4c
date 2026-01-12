import { Migration } from "@mikro-orm/migrations"

export class Migration20260112CreateCmsBlueprint extends Migration {
  async up(): Promise<void> {
    // Create tag_type enum
    this.addSql(`
      CREATE TYPE "tag_type_enum" AS ENUM (
        'dietary',
        'availability',
        'source',
        'fulfillment',
        'pricing',
        'organization',
        'location',
        'service',
        'facility',
        'condition',
        'portion'
      );
    `)

    // Create attribute_input_type enum
    this.addSql(`
      CREATE TYPE "attribute_input_type_enum" AS ENUM (
        'text',
        'number',
        'boolean',
        'select',
        'multiselect',
        'date',
        'datetime',
        'range',
        'json'
      );
    `)

    // Create attribute_display_type enum
    this.addSql(`
      CREATE TYPE "attribute_display_type_enum" AS ENUM (
        'text_input',
        'number_input',
        'checkbox',
        'dropdown',
        'radio',
        'multiselect',
        'range_slider',
        'date_picker',
        'tags'
      );
    `)

    // Create cms_type table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cms_type" (
        "id" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT,
        "display_order" INTEGER DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "cms_type_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create cms_category table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cms_category" (
        "id" TEXT NOT NULL,
        "type_id" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "icon" TEXT,
        "image_url" TEXT,
        "display_order" INTEGER DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "cms_category_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create cms_tag table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cms_tag" (
        "id" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "tag_type" "tag_type_enum" DEFAULT 'availability',
        "icon" TEXT,
        "color" TEXT,
        "is_active" BOOLEAN DEFAULT TRUE,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "cms_tag_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create cms_attribute table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cms_attribute" (
        "id" TEXT NOT NULL,
        "handle" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "input_type" "attribute_input_type_enum" DEFAULT 'text',
        "display_type" "attribute_display_type_enum" DEFAULT 'text_input',
        "unit" TEXT,
        "options" JSONB,
        "validation" JSONB,
        "is_filterable" BOOLEAN DEFAULT TRUE,
        "is_required" BOOLEAN DEFAULT FALSE,
        "display_order" INTEGER DEFAULT 0,
        "is_active" BOOLEAN DEFAULT TRUE,
        "metadata" JSONB,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "cms_attribute_pkey" PRIMARY KEY ("id")
      );
    `)

    // Create cms_category_tag junction table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cms_category_tag" (
        "id" TEXT NOT NULL,
        "category_id" TEXT NOT NULL,
        "tag_id" TEXT NOT NULL,
        "is_default" BOOLEAN DEFAULT FALSE,
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "cms_category_tag_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "cms_category_tag_unique" UNIQUE ("category_id", "tag_id")
      );
    `)

    // Create cms_category_attribute junction table
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "cms_category_attribute" (
        "id" TEXT NOT NULL,
        "category_id" TEXT NOT NULL,
        "attribute_id" TEXT NOT NULL,
        "is_required" BOOLEAN DEFAULT FALSE,
        "display_order" INTEGER DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "cms_category_attribute_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "cms_category_attribute_unique" UNIQUE ("category_id", "attribute_id")
      );
    `)

    // Create indexes
    this.addSql(`CREATE INDEX "idx_cms_type_handle" ON "cms_type" ("handle");`)
    this.addSql(`CREATE INDEX "idx_cms_type_active" ON "cms_type" ("is_active");`)
    this.addSql(`CREATE INDEX "idx_cms_category_type" ON "cms_category" ("type_id");`)
    this.addSql(`CREATE INDEX "idx_cms_category_handle" ON "cms_category" ("handle");`)
    this.addSql(`CREATE INDEX "idx_cms_category_active" ON "cms_category" ("is_active");`)
    this.addSql(`CREATE INDEX "idx_cms_tag_handle" ON "cms_tag" ("handle");`)
    this.addSql(`CREATE INDEX "idx_cms_tag_type" ON "cms_tag" ("tag_type");`)
    this.addSql(`CREATE INDEX "idx_cms_tag_active" ON "cms_tag" ("is_active");`)
    this.addSql(`CREATE INDEX "idx_cms_attribute_handle" ON "cms_attribute" ("handle");`)
    this.addSql(`CREATE INDEX "idx_cms_attribute_filterable" ON "cms_attribute" ("is_filterable");`)
    this.addSql(`CREATE INDEX "idx_cms_category_tag_category" ON "cms_category_tag" ("category_id");`)
    this.addSql(`CREATE INDEX "idx_cms_category_tag_tag" ON "cms_category_tag" ("tag_id");`)
    this.addSql(`CREATE INDEX "idx_cms_category_attribute_category" ON "cms_category_attribute" ("category_id");`)
    this.addSql(`CREATE INDEX "idx_cms_category_attribute_attribute" ON "cms_category_attribute" ("attribute_id");`)

    // Add foreign key constraints
    this.addSql(`
      ALTER TABLE "cms_category"
      ADD CONSTRAINT "fk_cms_category_type"
      FOREIGN KEY ("type_id") REFERENCES "cms_type" ("id")
      ON DELETE CASCADE;
    `)

    this.addSql(`
      ALTER TABLE "cms_category_tag"
      ADD CONSTRAINT "fk_cms_category_tag_category"
      FOREIGN KEY ("category_id") REFERENCES "cms_category" ("id")
      ON DELETE CASCADE;
    `)

    this.addSql(`
      ALTER TABLE "cms_category_tag"
      ADD CONSTRAINT "fk_cms_category_tag_tag"
      FOREIGN KEY ("tag_id") REFERENCES "cms_tag" ("id")
      ON DELETE CASCADE;
    `)

    this.addSql(`
      ALTER TABLE "cms_category_attribute"
      ADD CONSTRAINT "fk_cms_category_attribute_category"
      FOREIGN KEY ("category_id") REFERENCES "cms_category" ("id")
      ON DELETE CASCADE;
    `)

    this.addSql(`
      ALTER TABLE "cms_category_attribute"
      ADD CONSTRAINT "fk_cms_category_attribute_attribute"
      FOREIGN KEY ("attribute_id") REFERENCES "cms_attribute" ("id")
      ON DELETE CASCADE;
    `)
  }

  async down(): Promise<void> {
    // Drop foreign key constraints
    this.addSql(`ALTER TABLE "cms_category_attribute" DROP CONSTRAINT IF EXISTS "fk_cms_category_attribute_attribute";`)
    this.addSql(`ALTER TABLE "cms_category_attribute" DROP CONSTRAINT IF EXISTS "fk_cms_category_attribute_category";`)
    this.addSql(`ALTER TABLE "cms_category_tag" DROP CONSTRAINT IF EXISTS "fk_cms_category_tag_tag";`)
    this.addSql(`ALTER TABLE "cms_category_tag" DROP CONSTRAINT IF EXISTS "fk_cms_category_tag_category";`)
    this.addSql(`ALTER TABLE "cms_category" DROP CONSTRAINT IF EXISTS "fk_cms_category_type";`)

    // Drop tables
    this.addSql(`DROP TABLE IF EXISTS "cms_category_attribute";`)
    this.addSql(`DROP TABLE IF EXISTS "cms_category_tag";`)
    this.addSql(`DROP TABLE IF EXISTS "cms_attribute";`)
    this.addSql(`DROP TABLE IF EXISTS "cms_tag";`)
    this.addSql(`DROP TABLE IF EXISTS "cms_category";`)
    this.addSql(`DROP TABLE IF EXISTS "cms_type";`)

    // Drop enums
    this.addSql(`DROP TYPE IF EXISTS "attribute_display_type_enum";`)
    this.addSql(`DROP TYPE IF EXISTS "attribute_input_type_enum";`)
    this.addSql(`DROP TYPE IF EXISTS "tag_type_enum";`)
  }
}
