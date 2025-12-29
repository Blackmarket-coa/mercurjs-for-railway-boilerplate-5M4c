import { model } from "@medusajs/framework/utils"

/**
 * Growing Plan Model
 * 
 * A template or plan for what to grow in a season,
 * including crop rotations and companion planting.
 */
export const GrowingPlan = model.define("garden_growing_plan", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  season_id: model.text().nullable(), // null = template plan
  
  name: model.text(),
  description: model.text().nullable(),
  
  // Plan type
  plan_type: model.enum(["template", "seasonal", "crop_rotation"]).default("seasonal"),
  
  // Is this a template for reuse?
  is_template: model.boolean().default(false),
  template_source_id: model.text().nullable(), // If created from template
  
  // Planned crops
  planned_crops: model.json(), // [{ crop, variety, quantity, plot_id, start_date, notes }]
  
  // Succession planting
  succession_schedule: model.json().nullable(), // [{ crop, interval_days, quantity }]
  
  // Companion planting notes
  companion_notes: model.text().nullable(),
  
  // Rotation considerations
  previous_crops: model.json().nullable(), // What was grown here before
  rotation_family: model.json().nullable(), // Track plant families for rotation
  
  // Resources needed
  seeds_needed: model.json().nullable(), // [{ item, quantity, estimated_cost }]
  supplies_needed: model.json().nullable(),
  
  // Budget
  estimated_cost: model.bigNumber().nullable(),
  
  // Status
  status: model.enum(["draft", "approved", "active", "complete"]).default("draft"),
  
  // Approval
  approved_by_id: model.text().nullable(),
  approved_at: model.dateTime().nullable(),
  
  // Created by
  created_by_id: model.text().nullable(),
  
  metadata: model.json().nullable(),
})
