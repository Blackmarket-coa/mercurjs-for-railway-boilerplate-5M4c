import { model } from "@medusajs/framework/utils"
import OrderCycle from "./order-cycle"

/**
 * Order Cycle Seller - Links sellers to order cycles
 * 
 * Enables hub aggregation where multiple sellers/producers 
 * can participate in a single order cycle managed by a coordinator.
 * 
 * Example: A farmers market hub coordinates a weekly order cycle
 * where 5 different farms contribute products.
 */
const OrderCycleSeller = model.define("order_cycle_seller", {
  id: model.id().primaryKey(),
  
  // Reference to the order cycle
  order_cycle: model.belongsTo(() => OrderCycle, {
    mappedBy: "sellers",
  }),
  
  // Seller ID (linked via module link to MercurJS seller)
  seller_id: model.text(),
  
  // Role in this order cycle
  role: model.enum([
    "coordinator",   // Manages the order cycle
    "producer",      // Supplies products
    "hub",           // Aggregates from multiple producers
  ]).default("producer"),
  
  // Commission rate for this seller in this cycle (override)
  // Stored as percentage (e.g., 15.5 = 15.5%)
  commission_rate: model.float().nullable(),
  
  // Whether seller is active in this cycle
  is_active: model.boolean().default(true),
  
  // When seller was added to cycle
  joined_at: model.dateTime().default("now()"),
  
  // Metadata for extensions
  metadata: model.json().nullable(),
})
.indexes([
  {
    name: "IDX_OCS_ORDER_CYCLE_ID",
    on: ["order_cycle_id"],
  },
  {
    name: "IDX_OCS_SELLER_ID",
    on: ["seller_id"],
  },
  {
    name: "IDX_OCS_CYCLE_SELLER",
    on: ["order_cycle_id", "seller_id"],
    unique: true,
  },
])

export default OrderCycleSeller
