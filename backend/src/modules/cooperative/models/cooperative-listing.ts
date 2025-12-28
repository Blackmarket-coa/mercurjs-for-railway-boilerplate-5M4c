import { model } from "@medusajs/framework/utils"

/**
 * Aggregation Method
 */
export enum AggregationMethod {
  POOLED = "POOLED",       // Combined inventory from all members
  INDIVIDUAL = "INDIVIDUAL", // Separate listings per member
  HYBRID = "HYBRID",       // Mix of pooled and individual
}

/**
 * Cooperative Listing
 * 
 * Aggregates availability windows from multiple members
 * into a single cooperative storefront listing.
 * 
 * Enables food hub behavior where multiple producers
 * contribute to a shared product listing.
 */
const CooperativeListing = model.define("cooperative_listing", {
  id: model.id().primaryKey(),
  
  // Link to cooperative
  cooperative_id: model.text(),
  
  // Link to Medusa product (the unified storefront listing)
  product_id: model.text().nullable(),
  
  // Listing details
  name: model.text().searchable(),
  description: model.text().nullable(),
  
  // Aggregation method
  aggregation_method: model.enum(Object.values(AggregationMethod)).default(AggregationMethod.POOLED),
  
  // Pricing (for pooled listings)
  unified_price: model.float().nullable(),
  currency_code: model.text().default("usd"),
  
  // Availability windows included in this listing (JSON array of IDs)
  availability_window_ids: model.json().nullable(),
  
  // Quantity aggregation
  total_quantity_available: model.float().default(0),
  unit: model.text().nullable(),
  
  // Fulfillment
  aggregation_point: model.text().nullable(), // Where items are collected
  aggregation_deadline: model.dateTime().nullable(), // When items must arrive
  
  // Display
  featured: model.boolean().default(false),
  sort_order: model.number().default(0),
  
  // Status
  is_active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["cooperative_id"],
      name: "IDX_coop_listing_cooperative",
    },
    {
      on: ["product_id"],
      name: "IDX_coop_listing_product",
    },
    {
      on: ["is_active"],
      name: "IDX_coop_listing_active",
    },
    {
      on: ["featured"],
      name: "IDX_coop_listing_featured",
    },
  ])

export default CooperativeListing
