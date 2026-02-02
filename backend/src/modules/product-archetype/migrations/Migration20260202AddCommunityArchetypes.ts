import { Migration } from "@mikro-orm/migrations"

/**
 * Add community-aligned product archetypes.
 * Extends the product archetype system to support mutual aid, circular economy,
 * land access, community services, and experimental products.
 *
 * No drop-shipping: all fulfillment is community-internal.
 */
export class Migration20260202AddCommunityArchetypes extends Migration {
  async up(): Promise<void> {
    // Add new enum values to product_archetype_code_enum
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

    // Seed new community archetypes
    this.addSql(`
      INSERT INTO "product_archetype" (
        "id", "code", "name", "description",
        "inventory_strategy", "requires_availability_window", "supports_preorder",
        "perishable", "perishable_shelf_days", "requires_shipping",
        "supports_pickup", "supports_delivery", "fulfillment_lead_time_hours",
        "refundable", "return_window_days", "requires_lot_tracking",
        "supports_surplus_pricing", "requires_producer_link",
        "metadata"
      ) VALUES
      (
        'archetype_land_access', 'LAND_ACCESS', 'Land Access',
        'Community garden plots, farm plots — reservation-based, no inventory tracking',
        'NONE', true, false, false, null, false, false, false, null,
        false, null, false, false, false,
        '{"reservation_required": true, "inventory_tracking": false, "community_internal": true}'::jsonb
      ),
      (
        'archetype_mutual_aid', 'MUTUAL_AID', 'Mutual Aid',
        'Care kits, essentials, emergency support — community-funded, manual fulfillment',
        'STANDARD', false, false, false, null, false, true, true, null,
        false, null, false, false, false,
        '{"manual_fulfillment_required": true, "community_funded": true, "tax_exempt": true}'::jsonb
      ),
      (
        'archetype_circular_economy', 'CIRCULAR_ECONOMY', 'Circular Economy',
        'Repaired goods, salvaged materials, second-life electronics — condition-graded',
        'STANDARD', false, false, false, null, false, true, true, null,
        true, 14, false, false, false,
        '{"requires_condition_grade": true, "community_internal": true}'::jsonb
      ),
      (
        'archetype_community_service', 'COMMUNITY_SERVICE', 'Community Service',
        'Shared spaces, skill shares, community events — capacity-based',
        'CAPACITY', true, false, false, null, false, false, false, null,
        false, null, false, false, false,
        '{"capacity_based": true, "community_internal": true}'::jsonb
      ),
      (
        'archetype_experimental', 'EXPERIMENTAL', 'Experimental',
        'Prototype devices, pilot farming projects — requires governance approval',
        'STANDARD', false, false, false, null, false, true, false, null,
        false, null, false, false, false,
        '{"requires_governance_review": true, "requires_approval": true, "limited_availability": true}'::jsonb
      )
      ON CONFLICT ("code") DO NOTHING;
    `)
  }

  async down(): Promise<void> {
    // Remove the seeded archetypes (enum values cannot be removed in PostgreSQL)
    this.addSql(`
      DELETE FROM "product_archetype"
      WHERE "code" IN ('LAND_ACCESS', 'MUTUAL_AID', 'CIRCULAR_ECONOMY', 'COMMUNITY_SERVICE', 'EXPERIMENTAL');
    `)
  }
}
