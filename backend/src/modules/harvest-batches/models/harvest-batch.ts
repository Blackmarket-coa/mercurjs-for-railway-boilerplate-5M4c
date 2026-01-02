import { model } from "@medusajs/framework/utils"

/**
 * Batch Status
 */
export enum BatchStatus {
  PLANNED = "PLANNED",       // Future batch, not yet available
  AVAILABLE = "AVAILABLE",   // Currently available for purchase
  LOW_STOCK = "LOW_STOCK",   // Running low
  SOLD_OUT = "SOLD_OUT",     // Completely sold
  EXPIRED = "EXPIRED",       // Past best-by date
  CANCELLED = "CANCELLED",   // Cancelled by producer
}

/**
 * Season Tags
 */
export enum SeasonTag {
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
  WINTER = "WINTER",
  YEAR_ROUND = "YEAR_ROUND",
  LIMITED = "LIMITED",
  HOLIDAY = "HOLIDAY",
}

/**
 * Harvest Batch
 * 
 * Represents a limited quantity of product from a specific harvest/production.
 * Enables scarcity messaging and seasonal availability.
 */
const HarvestBatch = model.define("harvest_batch", {
  id: model.id().primaryKey(),
  
  // Link to product variant
  product_variant_id: model.text(),
  
  // Link to seller
  seller_id: model.text(),
  
  // Batch identification
  batch_code: model.text(),
  batch_name: model.text().nullable(),
  
  // === Quantity ===
  
  // Total quantity in batch
  total_quantity: model.number(),
  
  // Quantity sold
  sold_quantity: model.number().default(0),
  
  // Reserved quantity (in carts, etc.)
  reserved_quantity: model.number().default(0),
  
  // Unit of measure
  unit: model.text().default("each"),
  
  // === Timing ===
  
  // When batch was harvested/produced
  harvested_at: model.dateTime().nullable(),
  
  // When batch becomes available
  available_from: model.dateTime().nullable(),
  
  // When batch expires (best by)
  best_by: model.dateTime().nullable(),
  
  // When batch listing ends (sales window)
  available_until: model.dateTime().nullable(),
  
  // === Status ===
  status: model.enum(Object.values(BatchStatus)).default(BatchStatus.PLANNED),
  
  // Low stock threshold
  low_stock_threshold: model.number().default(5),
  
  // === Seasonal Tags ===
  season_tags: model.json().nullable(), // SeasonTag[]
  
  // Custom tags
  custom_tags: model.json().nullable(), // string[]
  
  // === Pricing ===
  
  // Batch-specific pricing (overrides product price)
  batch_price: model.bigNumber().nullable(),
  
  // Pre-order discount
  preorder_discount_percent: model.number().default(0),
  
  // === Story/Transparency ===
  
  // Harvest story (customer-visible)
  harvest_story: model.text().nullable(),
  
  // Location/origin
  origin_location: model.text().nullable(),
  
  // Growing/production practices for this batch
  practices: model.json().nullable(),
  
  // Photos from this batch
  batch_photos: model.json().nullable(), // string[]
  
  // === Metadata ===
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["product_variant_id"],
      name: "IDX_hb_variant_id",
    },
    {
      on: ["seller_id"],
      name: "IDX_hb_seller_id",
    },
    {
      on: ["status"],
      name: "IDX_hb_status",
    },
    {
      on: ["batch_code"],
      name: "IDX_hb_batch_code",
    },
    {
      on: ["available_from"],
      name: "IDX_hb_available_from",
    },
    {
      on: ["best_by"],
      name: "IDX_hb_best_by",
    },
  ])

export default HarvestBatch
