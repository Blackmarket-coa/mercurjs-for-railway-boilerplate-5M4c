import { model } from "@medusajs/framework/utils"

/**
 * Garden Model
 * 
 * Represents a community garden with its physical attributes,
 * organizational structure, governance model, and associated ledger accounts.
 */
export const Garden = model.define("garden", {
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
  producer_type: model.enum(["community", "school", "church", "cooperative", "municipal"]),
  
  // Capacity
  total_plots: model.number().default(0),
  total_sqft: model.number().default(0),
  
  // Status
  status: model.enum(["planning", "active", "dormant", "closed"]).default("planning"),
  current_season_id: model.text().nullable(),
  
  // Governance
  governance_model: model.enum([
    "equal_vote",        // One member, one vote
    "labor_weighted",    // Voting power based on volunteer hours
    "investment_weighted", // Voting power based on investment
    "hybrid"             // Combination of factors
  ]).default("equal_vote"),
  
  // Ledger accounts (created on garden creation via hawala ledger)
  operating_account_id: model.text().nullable(),
  tool_fund_account_id: model.text().nullable(),
  seed_fund_account_id: model.text().nullable(),
  harvest_pool_account_id: model.text().nullable(),
  volunteer_credit_pool_id: model.text().nullable(),
  investment_pool_account_id: model.text().nullable(),
  
  // Settings
  settings: model.json().nullable(), // { allow_investments, volunteer_hour_value, min_plot_fee, etc }
  
  // Contact
  contact_email: model.text().nullable(),
  contact_phone: model.text().nullable(),
  website: model.text().nullable(),
  
  // Images
  cover_image_url: model.text().nullable(),
  gallery_urls: model.json().nullable(), // string[]
  
  metadata: model.json().nullable(),
})
