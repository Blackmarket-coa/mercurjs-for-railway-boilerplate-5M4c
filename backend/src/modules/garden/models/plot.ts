import { model } from "@medusajs/framework/utils"

/**
 * Garden Plot Model
 * 
 * Represents an individual plot within a garden that can be
 * assigned to members for growing.
 */
export const GardenPlot = model.define("garden_plot", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  // Physical attributes
  plot_number: model.text(),
  size_sqft: model.number(),
  soil_zone_id: model.text().nullable(),
  
  // Location within garden
  row: model.number().nullable(),
  column: model.number().nullable(),
  section: model.text().nullable(), // "A", "B", "North", etc.
  
  // Features
  has_water_access: model.boolean().default(false),
  has_raised_bed: model.boolean().default(false),
  is_accessible: model.boolean().default(false), // ADA accessible
  sun_exposure: model.enum(["full_sun", "partial_sun", "shade"]).nullable(),
  
  // Assignment
  assigned_to_id: model.text().nullable(), // customer_id
  assignment_type: model.enum(["individual", "shared", "communal"]).default("individual"),
  
  // Season
  season_id: model.text().nullable(),
  
  // Status
  status: model.enum(["available", "assigned", "growing", "fallow", "maintenance"]).default("available"),
  
  // Pricing (in ledger credits or USD)
  season_fee: model.bigNumber().nullable(),
  fee_type: model.enum(["usd", "volunteer_hours", "harvest_share", "free"]).default("usd"),
  
  // Notes
  notes: model.text().nullable(),
  
  metadata: model.json().nullable(),
})
