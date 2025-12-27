import { model } from "@medusajs/framework/utils"

/**
 * Order Cycle Exchange - Represents incoming/outgoing product flows
 * 
 * OFN-style exchanges model the flow of products:
 * - Incoming: Products coming FROM producers TO the order cycle
 * - Outgoing: Products going FROM the order cycle TO distributors/customers
 */
const OrderCycleExchange = model.define("order_cycle_exchange", {
  id: model.id().primaryKey(),
  
  // Reference to the order cycle (store as text, linked separately)
  order_cycle_id: model.text(),
  
  // Direction of exchange
  exchange_type: model.enum([
    "incoming",   // Products coming from producer
    "outgoing",   // Products going to distributor
  ]),
  
  // The seller involved in this exchange
  seller_id: model.text(),
  
  // For incoming: receiver (usually the coordinator)
  receiver_id: model.text().nullable(),
  
  // Pickup/delivery instructions specific to this exchange
  pickup_time: model.text().nullable(),
  pickup_instructions: model.text().nullable(),
  
  // For outgoing: delivery/ready date for this distributor
  ready_at: model.dateTime().nullable(),
  
  // Tags for visibility control (e.g., "members-only")
  tags: model.json().nullable(),
  
  // Whether this exchange is active
  is_active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})
.indexes([
  {
    name: "IDX_OCE_ORDER_CYCLE_ID",
    on: ["order_cycle_id"],
  },
  {
    name: "IDX_OCE_EXCHANGE_TYPE",
    on: ["exchange_type"],
  },
  {
    name: "IDX_OCE_SELLER_ID",
    on: ["seller_id"],
  },
  {
    name: "IDX_OCE_CYCLE_TYPE_SELLER",
    on: ["order_cycle_id", "exchange_type", "seller_id"],
    unique: true,
  },
])

export default OrderCycleExchange
