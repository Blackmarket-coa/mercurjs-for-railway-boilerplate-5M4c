import { model } from "@medusajs/framework/utils"

/**
 * Garden Harvest Model
 * 
 * Records a harvest event from the garden,
 * tracking what was harvested and when.
 */
export const GardenHarvest = model.define("garden_harvest", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  season_id: model.text(),
  
  // What was harvested
  crop_type: model.text(),
  variety: model.text().nullable(),
  
  // When
  harvested_at: model.dateTime(),
  
  // How much
  total_quantity: model.bigNumber(),
  unit: model.text(), // "lbs", "bunches", "heads", "pieces"
  
  // Quality grading
  quality_grade: model.enum(["premium", "standard", "seconds", "compost"]).nullable(),
  
  // Estimated value
  estimated_value_per_unit: model.bigNumber().nullable(),
  total_estimated_value: model.bigNumber().nullable(),
  
  // Allocation status
  allocation_status: model.enum(["pending", "allocated", "claimed", "complete"]).default("pending"),
  
  // From which plantings
  planting_ids: model.json().nullable(), // string[]
  
  // From which plots (if specific)
  plot_ids: model.json().nullable(), // string[]
  
  // Harvested by
  harvested_by_ids: model.json().nullable(), // customer_ids who participated
  
  // Storage
  storage_location: model.text().nullable(),
  storage_notes: model.text().nullable(),
  best_by: model.dateTime().nullable(),
  
  // Photos
  photo_urls: model.json().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
