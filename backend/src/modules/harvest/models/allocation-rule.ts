import { model } from "@medusajs/framework/utils"

/**
 * Allocation Rule Model
 * 
 * Defines the rules for how harvests are allocated in a garden.
 * Can be set at garden level or overridden per crop/season.
 */
export const AllocationRule = model.define("garden_allocation_rule", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  // Scope
  season_id: model.text().nullable(), // null = garden default
  crop_type: model.text().nullable(),  // null = all crops
  
  name: model.text(),
  description: model.text().nullable(),
  
  // Rule type
  pool_type: model.enum([
    "investor",
    "volunteer",
    "plot_holder",
    "communal",
    "open_market",
    "donation",
    "seed_saving",
    "reserved"
  ]),
  
  // Allocation
  percentage: model.bigNumber(),
  priority: model.number().default(1), // Lower = allocated first
  
  // Conditions
  min_quantity: model.bigNumber().nullable(), // Only apply if harvest >= this
  max_quantity: model.bigNumber().nullable(), // Cap at this amount
  
  // Active
  is_active: model.boolean().default(true),
  effective_from: model.dateTime().nullable(),
  effective_until: model.dateTime().nullable(),
  
  // Governance
  approved_by_proposal_id: model.text().nullable(),
  
  metadata: model.json().nullable(),
})
