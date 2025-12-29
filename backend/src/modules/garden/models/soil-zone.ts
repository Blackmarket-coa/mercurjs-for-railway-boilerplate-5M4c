import { model } from "@medusajs/framework/utils"

/**
 * Soil Zone Model
 * 
 * Represents a soil zone within a garden with specific
 * soil characteristics and growing recommendations.
 */
export const SoilZone = model.define("garden_soil_zone", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  name: model.text(), // "Zone A", "North Beds", etc.
  
  // Soil characteristics
  soil_type: model.enum([
    "clay",
    "sandy",
    "loam",
    "silt",
    "peat",
    "chalk",
    "mixed"
  ]).nullable(),
  
  ph_level: model.bigNumber().nullable(),
  organic_matter_percent: model.bigNumber().nullable(),
  
  // Drainage
  drainage: model.enum(["poor", "moderate", "good", "excellent"]).nullable(),
  
  // Amendments history
  last_amended_at: model.dateTime().nullable(),
  amendments_applied: model.json().nullable(), // [{ date, type, quantity }]
  
  // Testing
  last_tested_at: model.dateTime().nullable(),
  test_results: model.json().nullable(),
  
  // Recommendations
  recommended_crops: model.json().nullable(), // string[]
  avoid_crops: model.json().nullable(), // string[]
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
