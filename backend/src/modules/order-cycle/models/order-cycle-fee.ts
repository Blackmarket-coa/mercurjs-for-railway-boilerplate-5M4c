import { model } from "@medusajs/framework/utils"

/**
 * Order Cycle Fee - Links fees to order cycles
 * 
 * Fees can be applied at different levels:
 * - coordinator: applies to entire order cycle
 * - incoming: applies to specific producer's products
 * - outgoing: applies to specific distributor
 */
const OrderCycleFee = model.define("order_cycle_fee", {
  id: model.id().primaryKey(),
  
  // Reference to the order cycle
  order_cycle_id: model.text(),
  
  // Reference to the fee template
  enterprise_fee_id: model.text(),
  
  // Where this fee is applied
  application_type: model.enum([
    "coordinator",  // Applied by coordinator to all products
    "incoming",     // Applied to incoming products from a producer
    "outgoing",     // Applied to outgoing products to a distributor
  ]),
  
  // For incoming/outgoing: which seller this fee relates to
  target_seller_id: model.text().nullable(),
  
  // Display order
  display_order: model.number().default(0),
  
  // Metadata
  metadata: model.json().nullable(),
})
.indexes([
  {
    name: "IDX_OCF_ORDER_CYCLE_ID",
    on: ["order_cycle_id"],
  },
  {
    name: "IDX_OCF_ENTERPRISE_FEE_ID",
    on: ["enterprise_fee_id"],
  },
  {
    name: "IDX_OCF_APPLICATION_TYPE",
    on: ["application_type"],
  },
  {
    name: "IDX_OCF_TARGET_SELLER",
    on: ["target_seller_id"],
  },
])

export default OrderCycleFee
