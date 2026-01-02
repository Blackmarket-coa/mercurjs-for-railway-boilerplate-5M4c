import { model } from "@medusajs/framework/utils"

/**
 * Buyer Impact
 * 
 * Aggregated impact metrics for a customer's purchases.
 * Updated after each order completion.
 */
const BuyerImpact = model.define("buyer_impact", {
  id: model.id().primaryKey(),
  
  // Link to customer
  customer_id: model.text().unique(),
  
  // === Financial Impact ===
  
  // Total spent on platform
  total_spent: model.bigNumber().default(0),
  
  // Total sent directly to producers
  total_to_producers: model.bigNumber().default(0),
  
  // Platform fees paid (supports the marketplace)
  total_platform_fees: model.bigNumber().default(0),
  
  // Community reinvestment contributions
  total_community_reinvestment: model.bigNumber().default(0),
  
  // === Producer Support ===
  
  // Unique producers supported
  unique_producers_supported: model.number().default(0),
  
  // Producer IDs (JSON array)
  producer_ids: model.json().nullable(), // string[]
  
  // === Environmental Impact ===
  
  // Estimated miles saved vs grocery store supply chain
  estimated_miles_saved: model.number().default(0),
  
  // Average distance food traveled
  avg_food_miles: model.number().default(0),
  
  // === Order Stats ===
  
  // Total orders placed
  total_orders: model.number().default(0),
  
  // Repeat orders (to same producer)
  repeat_orders: model.number().default(0),
  
  // Subscription orders
  subscription_orders: model.number().default(0),
  
  // === Time-based ===
  
  // First purchase date
  first_purchase_at: model.dateTime().nullable(),
  
  // Most recent purchase date
  last_purchase_at: model.dateTime().nullable(),
  
  // Months active
  months_active: model.number().default(0),
  
  // === Badges Earned ===
  badges: model.json().nullable(), // { badge_id: string, earned_at: Date }[]
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["customer_id"],
      name: "IDX_buyer_impact_customer_id",
    },
    {
      on: ["total_to_producers"],
      name: "IDX_buyer_impact_total_to_producers",
    },
    {
      on: ["unique_producers_supported"],
      name: "IDX_buyer_impact_producers_supported",
    },
  ])

export default BuyerImpact
