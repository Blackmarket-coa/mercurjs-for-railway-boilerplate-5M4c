import { Migration } from "@mikro-orm/migrations"

/**
 * Seed community-aligned product archetypes.
 *
 * This migration runs AFTER Migration20260202AddCommunityArchetypes which adds
 * the enum values. PostgreSQL requires enum values to be committed in a separate
 * transaction before they can be used in INSERT statements.
 *
 * Archetypes added:
 * - LAND_ACCESS: Community garden plots, farm plots
 * - MUTUAL_AID: Care kits, essentials, emergency support
 * - CIRCULAR_ECONOMY: Repaired goods, salvaged materials
 * - COMMUNITY_SERVICE: Shared spaces, skill shares, community events
 * - EXPERIMENTAL: Prototype devices, pilot farming projects
 */
export class Migration20260202001SeedCommunityArchetypes extends Migration {
  async up(): Promise<void> {
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
    // Remove the seeded archetypes
    this.addSql(`
      DELETE FROM "product_archetype"
      WHERE "code" IN ('LAND_ACCESS', 'MUTUAL_AID', 'CIRCULAR_ECONOMY', 'COMMUNITY_SERVICE', 'EXPERIMENTAL');
    `)
  }
}
