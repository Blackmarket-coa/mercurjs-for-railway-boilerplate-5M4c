import { model } from "@medusajs/framework/utils"

/**
 * Harvest Allocation Model
 * 
 * Defines how a harvest is divided among different pools
 * (investors, volunteers, plot holders, etc.)
 */
export const HarvestAllocation = model.define("garden_harvest_allocation", {
  id: model.id().primaryKey(),
  harvest_id: model.text(),
  garden_id: model.text(),
  
  // Which pool gets this allocation
  pool_type: model.enum([
    "investor",         // Goes to investment pool contributors
    "volunteer",        // Goes to volunteer hour holders
    "plot_holder",      // Goes to individual plot holders
    "communal",         // Split among all members
    "open_market",      // Available for sale on marketplace
    "donation",         // Food bank, community fridge, etc.
    "seed_saving",      // Reserved for next season's seeds
    "reserved"          // Reserved for specific purpose
  ]),
  
  // Amount allocated
  quantity: model.bigNumber(),
  unit: model.text(),
  percentage: model.bigNumber(), // Of total harvest
  
  // Value
  estimated_value: model.bigNumber().nullable(),
  
  // Priority (lower = allocated first)
  priority: model.number().default(1),
  
  // Status
  status: model.enum(["allocated", "claiming", "claimed", "distributed", "expired"]).default("allocated"),
  
  // For donation pool
  donation_recipient: model.text().nullable(),
  donation_contact: model.json().nullable(),
  
  // For market pool
  listing_id: model.text().nullable(), // If listed on marketplace
  
  // Claim deadline
  claim_deadline: model.dateTime().nullable(),
  
  // Distribution details
  distribution_date: model.dateTime().nullable(),
  distribution_location: model.text().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
