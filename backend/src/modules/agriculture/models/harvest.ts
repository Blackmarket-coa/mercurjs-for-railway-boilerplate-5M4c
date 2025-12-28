import { model } from "@medusajs/framework/utils"

/**
 * Season Enum
 */
export enum Season {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
  YEAR_ROUND = "YEAR_ROUND",
}

/**
 * Harvest Visibility Status
 */
export enum HarvestVisibility {
  DRAFT = "DRAFT",       // Not visible to anyone except producer
  PREVIEW = "PREVIEW",   // Visible but not purchasable
  PUBLIC = "PUBLIC",     // Fully visible and purchasable
  ARCHIVED = "ARCHIVED", // Historical record
}

/**
 * Harvest
 * 
 * A harvest represents a REAL AGRICULTURAL EVENT, not inventory.
 * This is a customer-visible entity that provides transparency
 * into when and how food was grown.
 * 
 * One harvest can produce multiple lots/batches.
 */
const Harvest = model.define("harvest", {
  id: model.id().primaryKey(),
  
  // Link to producer
  producer_id: model.text(),
  
  // Crop identification
  crop_name: model.text().searchable(), // e.g., "Heirloom Tomatoes"
  variety: model.text().nullable(),      // e.g., "Brandywine"
  category: model.text().nullable(),     // e.g., "Vegetables", "Fruits", "Dairy"
  
  // Harvest timing
  harvest_date: model.dateTime().nullable(), // Actual or expected
  planted_date: model.dateTime().nullable(),
  season: model.enum(Object.values(Season)).default(Season.YEAR_ROUND),
  year: model.number(), // Harvest year for historical tracking
  
  // Growing details (customer-visible)
  growing_method: model.text().nullable(), // e.g., "Field grown", "Greenhouse"
  field_name: model.text().nullable(),     // e.g., "North Field", "Orchard Block A"
  
  // Producer notes (storytelling, customer-facing)
  farmer_notes: model.text().nullable(),
  weather_notes: model.text().nullable(),
  taste_notes: model.text().nullable(),
  usage_tips: model.text().nullable(),
  
  // Media
  photo: model.text().nullable(),
  gallery: model.json().nullable(), // string[]
  
  // Expected yield (planning purposes)
  expected_yield_quantity: model.float().nullable(),
  expected_yield_unit: model.text().nullable(), // lb, kg, bunch, case, etc.
  
  // Visibility control
  visibility_status: model.enum(Object.values(HarvestVisibility)).default(HarvestVisibility.DRAFT),
  published_at: model.dateTime().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["producer_id"],
      name: "IDX_harvest_producer",
    },
    {
      on: ["crop_name"],
      name: "IDX_harvest_crop",
    },
    {
      on: ["season"],
      name: "IDX_harvest_season",
    },
    {
      on: ["year"],
      name: "IDX_harvest_year",
    },
    {
      on: ["visibility_status"],
      name: "IDX_harvest_visibility",
    },
    {
      on: ["harvest_date"],
      name: "IDX_harvest_date",
    },
  ])

export default Harvest
