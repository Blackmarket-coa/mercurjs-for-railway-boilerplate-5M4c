import { model } from "@medusajs/framework/utils"

/**
 * Order Impact
 * 
 * Impact metrics for a single order.
 * Used to generate impact receipts and update aggregates.
 */
const OrderImpact = model.define("order_impact", {
  id: model.id().primaryKey(),
  
  // Link to order
  order_id: model.text().unique(),
  
  // Links
  customer_id: model.text(),
  
  // === Financial Breakdown ===
  
  // Order total (what customer paid)
  order_total: model.bigNumber(),
  
  // Amount to producer(s)
  producer_amount: model.bigNumber(),
  
  // Platform fee
  platform_fee: model.bigNumber(),
  
  // Delivery/shipping
  delivery_fee: model.bigNumber().default(0),
  
  // Community reinvestment
  community_reinvestment: model.bigNumber().default(0),
  
  // Tips
  tip_amount: model.bigNumber().default(0),
  
  // === Producer Breakdown ===
  // JSON array of { seller_id, amount, percentage }
  producer_breakdown: model.json(),
  
  // === Distance/Environmental ===
  
  // Estimated food miles
  food_miles: model.number().default(0),
  
  // Miles saved vs grocery store (estimated)
  miles_saved: model.number().default(0),
  
  // Is this a local order (under 100 miles)
  is_local: model.boolean().default(true),
  
  // === Metadata ===
  
  // Order type
  order_type: model.enum(["ONE_TIME", "SUBSCRIPTION", "PRE_ORDER", "STANDING"]).default("ONE_TIME"),
  
  // Is repeat order to same producer
  is_repeat: model.boolean().default(false),
  
  // Timestamp
  created_at: model.dateTime(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["order_id"],
      name: "IDX_order_impact_order_id",
    },
    {
      on: ["customer_id"],
      name: "IDX_order_impact_customer_id",
    },
    {
      on: ["created_at"],
      name: "IDX_order_impact_created_at",
    },
  ])

export default OrderImpact
