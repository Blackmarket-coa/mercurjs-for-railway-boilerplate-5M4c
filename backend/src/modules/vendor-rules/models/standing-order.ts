import { model } from "@medusajs/framework/utils"

/**
 * Standing Order
 * 
 * Recurring orders from established customers.
 * Provides revenue predictability for vendors.
 */
const StandingOrder = model.define("standing_order", {
  id: model.id().primaryKey(),
  
  // Links
  seller_id: model.text(),
  customer_id: model.text(),
  
  // Order name
  name: model.text(),
  
  // === Schedule ===
  
  // Frequency
  frequency: model.enum([
    "WEEKLY",
    "BIWEEKLY",
    "MONTHLY",
    "CUSTOM",
  ]),
  
  // Day of week for weekly/biweekly
  day_of_week: model.number().nullable(),
  
  // Day of month for monthly
  day_of_month: model.number().nullable(),
  
  // Custom frequency (days between orders)
  custom_frequency_days: model.number().nullable(),
  
  // Start date
  start_date: model.dateTime(),
  
  // End date (null = ongoing)
  end_date: model.dateTime().nullable(),
  
  // Next order date
  next_order_date: model.dateTime().nullable(),
  
  // === Order Contents ===
  
  // Line items (JSON array)
  // { variant_id, quantity, price_override? }[]
  line_items: model.json(),
  
  // Total value per order
  order_value: model.bigNumber(),
  
  // Delivery/pickup preference
  fulfillment_method: model.text(),
  
  // Fulfillment window ID
  fulfillment_window_id: model.text().nullable(),
  
  // === Status ===
  
  status: model.enum([
    "ACTIVE",
    "PAUSED",
    "CANCELLED",
    "COMPLETED",
  ]).default("ACTIVE"),
  
  // Pause reason
  pause_reason: model.text().nullable(),
  
  // === History ===
  
  // Total orders generated
  orders_generated: model.number().default(0),
  
  // Total value fulfilled
  total_fulfilled_value: model.bigNumber().default(0),
  
  // Last order date
  last_order_date: model.dateTime().nullable(),
  
  // Order IDs generated
  order_ids: model.json().nullable(), // string[]
  
  // Notes
  customer_notes: model.text().nullable(),
  vendor_notes: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["seller_id"],
      name: "IDX_so_seller_id",
    },
    {
      on: ["customer_id"],
      name: "IDX_so_customer_id",
    },
    {
      on: ["status"],
      name: "IDX_so_status",
    },
    {
      on: ["next_order_date"],
      name: "IDX_so_next_order",
    },
  ])

export default StandingOrder
