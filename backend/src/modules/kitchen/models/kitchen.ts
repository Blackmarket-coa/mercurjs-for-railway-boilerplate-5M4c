import { model } from "@medusajs/framework/utils"

/**
 * Kitchen Model
 *
 * Represents a commercial community kitchen with its physical attributes,
 * organizational structure, governance model, and associated ledger accounts.
 *
 * Commercial community kitchens are shared-use facilities where food
 * entrepreneurs, caterers, and community members can prepare food
 * for sale or distribution.
 */
export const Kitchen = model.define("kitchen", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text().unique(),
  description: model.text().nullable(),

  // Location
  address: model.text(),
  city: model.text(),
  state: model.text(),
  zip: model.text(),
  coordinates: model.json().nullable(), // { lat: number, lng: number }

  // Organization
  managing_org_id: model.text().nullable(), // Links to vendor if org-managed
  kitchen_type: model.enum([
    "community",      // Community-owned shared kitchen
    "incubator",      // Business incubator kitchen
    "cooperative",    // Worker-owned cooperative kitchen
    "nonprofit",      // Nonprofit community kitchen
    "church",         // Church or faith-based community kitchen
    "school",         // School or educational kitchen
    "municipal"       // City/county-owned community kitchen
  ]),

  // Facility Details
  total_sqft: model.number().default(0),
  total_stations: model.number().default(0), // Workstations available
  max_concurrent_users: model.number().default(1),

  // Licensing & Certifications
  health_permit_number: model.text().nullable(),
  health_permit_expires: model.dateTime().nullable(),
  certifications: model.json().nullable(), // ["USDA", "Organic", "Kosher", etc.]

  // Status
  status: model.enum(["planning", "active", "renovation", "closed"]).default("planning"),

  // Governance
  governance_model: model.enum([
    "equal_vote",        // One member, one vote
    "usage_weighted",    // Voting power based on kitchen time usage
    "investment_weighted", // Voting power based on investment
    "hybrid"             // Combination of factors
  ]).default("equal_vote"),

  // Ledger accounts (created on kitchen creation via hawala ledger)
  operating_account_id: model.text().nullable(),
  equipment_fund_account_id: model.text().nullable(),
  maintenance_fund_account_id: model.text().nullable(),
  member_deposit_pool_id: model.text().nullable(),
  investment_pool_account_id: model.text().nullable(),

  // Pricing
  hourly_rate: model.bigNumber().nullable(), // Default hourly rental rate
  monthly_membership_fee: model.bigNumber().nullable(),
  deposit_required: model.bigNumber().nullable(),

  // Settings
  settings: model.json().nullable(), // { min_rental_hours, advance_booking_days, cleanup_time_minutes, etc }

  // Operating Hours
  operating_hours: model.json().nullable(), // { monday: { open: "06:00", close: "22:00" }, ... }

  // Amenities
  amenities: model.json().nullable(), // ["cold_storage", "dry_storage", "loading_dock", "packaging_equipment", etc.]
  equipment_list: model.json().nullable(), // Detailed equipment inventory

  // Contact
  contact_email: model.text().nullable(),
  contact_phone: model.text().nullable(),
  website: model.text().nullable(),

  // Images
  cover_image_url: model.text().nullable(),
  gallery_urls: model.json().nullable(), // string[]

  metadata: model.json().nullable(),
})
