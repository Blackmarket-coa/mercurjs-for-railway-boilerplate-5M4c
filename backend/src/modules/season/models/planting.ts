import { model } from "@medusajs/framework/utils"

/**
 * Garden Planting Model
 * 
 * Tracks individual plantings within a garden season,
 * including crop details, timing, and yield tracking.
 */
export const GardenPlanting = model.define("garden_planting", {
  id: model.id().primaryKey(),
  season_id: model.text(),
  garden_id: model.text(),
  plot_id: model.text().nullable(), // null = communal area
  
  // What
  crop_type: model.text(), // "tomato", "lettuce", "squash"
  variety: model.text().nullable(), // "Cherokee Purple", "Buttercrunch"
  category: model.enum([
    "vegetable",
    "fruit",
    "herb",
    "flower",
    "cover_crop",
    "other"
  ]).default("vegetable"),
  
  // Source
  source_type: model.enum(["seed", "transplant", "cutting", "division"]).default("seed"),
  source_vendor_id: model.text().nullable(), // If purchased from platform vendor
  source_notes: model.text().nullable(),
  
  // Timing
  started_at: model.dateTime().nullable(), // Indoor start date
  planted_at: model.dateTime().nullable(), // Outdoor transplant/direct sow
  expected_harvest: model.dateTime().nullable(),
  actual_harvest_start: model.dateTime().nullable(),
  actual_harvest_end: model.dateTime().nullable(),
  
  // Quantity
  quantity: model.number(),
  unit: model.text(), // "plants", "seeds", "starts", "rows"
  spacing_inches: model.number().nullable(),
  
  // Expected yield
  expected_yield: model.bigNumber().nullable(),
  yield_unit: model.text().nullable(), // "lbs", "bunches", "heads", "pieces"
  
  // Status
  status: model.enum([
    "planned",
    "started",     // Seeds started indoors
    "planted",     // In the ground
    "growing",
    "flowering",
    "fruiting",
    "ready",       // Ready to harvest
    "harvesting",  // Ongoing harvest
    "harvested",   // Complete
    "failed"       // Did not succeed
  ]).default("planned"),
  
  // Actual results
  actual_yield: model.bigNumber().nullable(),
  
  // Health tracking
  health_status: model.enum(["excellent", "good", "fair", "poor", "dead"]).nullable(),
  issues: model.json().nullable(), // [{ date, issue, treatment }]
  
  // Care log
  care_log: model.json().nullable(), // [{ date, action, notes }]
  
  // Photos
  photo_urls: model.json().nullable(), // string[]
  
  // Who planted
  planted_by_id: model.text().nullable(), // customer_id
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
