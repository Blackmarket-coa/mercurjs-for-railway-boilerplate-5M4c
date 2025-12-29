import { model } from "@medusajs/framework/utils"

/**
 * Garden Membership Model
 * 
 * Represents a member's relationship with a garden,
 * including their roles, balances, and governance participation.
 */
export const GardenMembership = model.define("garden_membership", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  customer_id: model.text(),
  
  // Type
  membership_type: model.enum([
    "plot_holder",      // Has assigned plot(s)
    "harvest_share",    // Gets share of communal harvest
    "volunteer",        // Contributes labor
    "investor",         // Financial supporter
    "patron",           // Recurring supporter
    "organizer"         // Garden coordinator/manager
  ]),
  
  // Status
  status: model.enum(["pending", "active", "suspended", "expired", "cancelled"]).default("pending"),
  
  // Balances (denormalized for quick access, derived from ledger)
  volunteer_hours_balance: model.bigNumber().default(0),
  harvest_credits_balance: model.bigNumber().default(0),
  investment_balance: model.bigNumber().default(0),
  
  // Governance
  voting_power: model.bigNumber().default(1),
  roles: model.json().nullable(), // ["treasurer", "plot_coordinator", "work_party_lead", etc.]
  
  // Season
  season_id: model.text().nullable(),
  
  // Plot assignment (if plot_holder)
  assigned_plot_ids: model.json().nullable(), // string[]
  
  // Volunteer preferences
  volunteer_preferences: model.json().nullable(), // { preferred_activities: [], available_days: [] }
  
  // Emergency contact
  emergency_contact: model.json().nullable(), // { name, phone, relationship }
  
  // Agreements
  waiver_signed_at: model.dateTime().nullable(),
  rules_accepted_at: model.dateTime().nullable(),
  
  // Dates
  joined_at: model.dateTime(),
  expires_at: model.dateTime().nullable(),
  renewed_at: model.dateTime().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
