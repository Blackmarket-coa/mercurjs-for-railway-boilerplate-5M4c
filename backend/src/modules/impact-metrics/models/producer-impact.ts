import { model } from "@medusajs/framework/utils"

/**
 * Producer Impact
 * 
 * Aggregated impact metrics for a seller/producer.
 * Shows both financial and community impact.
 */
const ProducerImpact = model.define("producer_impact", {
  id: model.id().primaryKey(),
  
  // Link to seller
  seller_id: model.text().unique(),
  
  // === Financial Metrics ===
  
  // Total revenue (before fees)
  total_revenue: model.bigNumber().default(0),
  
  // Net payout to producer
  total_payout: model.bigNumber().default(0),
  
  // Platform fees paid
  total_platform_fees: model.bigNumber().default(0),
  
  // Tips received (if enabled)
  total_tips: model.bigNumber().default(0),
  
  // === Revenue Predictability ===
  
  // Revenue stability score (0-100)
  // Higher = more predictable income
  revenue_stability_score: model.number().default(0),
  
  // Percentage from subscriptions/recurring
  subscription_revenue_percent: model.number().default(0),
  
  // Percentage from repeat customers
  repeat_customer_revenue_percent: model.number().default(0),
  
  // === Customer Metrics ===
  
  // Total unique customers
  total_customers: model.number().default(0),
  
  // Repeat customers (2+ orders)
  repeat_customers: model.number().default(0),
  
  // Active subscribers
  active_subscribers: model.number().default(0),
  
  // === Order Metrics ===
  
  // Total orders fulfilled
  total_orders: model.number().default(0),
  
  // Average order value
  avg_order_value: model.bigNumber().default(0),
  
  // Fulfillment reliability (% on-time)
  fulfillment_reliability: model.number().default(100),
  
  // === Time-based ===
  
  // Revenue this month
  monthly_revenue: model.bigNumber().default(0),
  
  // Revenue last month (for comparison)
  last_month_revenue: model.bigNumber().default(0),
  
  // Months selling on platform
  months_active: model.number().default(0),
  
  // First sale date
  first_sale_at: model.dateTime().nullable(),
  
  // Most recent sale
  last_sale_at: model.dateTime().nullable(),
  
  // === Community Impact ===
  
  // Local customers served
  local_customers: model.number().default(0),
  
  // Average delivery distance (miles)
  avg_delivery_distance: model.number().default(0),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["seller_id"],
      name: "IDX_producer_impact_seller_id",
    },
    {
      on: ["revenue_stability_score"],
      name: "IDX_producer_impact_stability",
    },
    {
      on: ["total_revenue"],
      name: "IDX_producer_impact_revenue",
    },
  ])

export default ProducerImpact
