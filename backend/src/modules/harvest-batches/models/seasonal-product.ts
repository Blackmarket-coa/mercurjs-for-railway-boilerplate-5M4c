import { model } from "@medusajs/framework/utils"

/**
 * Seasonal Product
 * 
 * Tracks seasonal availability for products.
 * Helps customers know when to expect items.
 */
const SeasonalProduct = model.define("seasonal_product", {
  id: model.id().primaryKey(),
  
  // Link to product
  product_id: model.text(),
  
  // Link to seller
  seller_id: model.text(),
  
  // === Typical Availability ===
  
  // Months typically available (1-12)
  available_months: model.json(), // number[]
  
  // Peak months (best quality/price)
  peak_months: model.json().nullable(), // number[]
  
  // Is this year-round with seasonal peaks?
  year_round_with_peaks: model.boolean().default(false),
  
  // === Seasonal Notes ===
  
  // Customer-visible seasonal info
  seasonal_notes: model.text().nullable(),
  
  // What affects availability
  availability_factors: model.text().nullable(),
  
  // === Pre-order Settings ===
  
  // Allow pre-orders when out of season
  allow_preorder: model.boolean().default(false),
  
  // Pre-order lead time (days)
  preorder_lead_days: model.number().default(14),
  
  // === Notification Settings ===
  
  // Notify customers when back in season
  notify_when_available: model.boolean().default(true),
  
  // Customer IDs waiting for notification
  notification_list: model.json().nullable(), // string[]
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["product_id"],
      name: "IDX_sp_product_id",
    },
    {
      on: ["seller_id"],
      name: "IDX_sp_seller_id",
    },
  ])

export default SeasonalProduct
