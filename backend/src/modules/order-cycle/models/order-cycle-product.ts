import { model } from "@medusajs/framework/utils"

/**
 * Order Cycle Product - Links products to order cycles
 *
 * Products can be added to an order cycle with:
 * - Optional quantity limits (available_quantity)
 * - Optional price overrides (for cycle-specific pricing)
 * - Stock tracking per cycle
 * - Link to incoming/outgoing exchange
 */
const OrderCycleProduct = model.define("order_cycle_product", {
  id: model.id().primaryKey(),
  
  // Reference to the order cycle
  order_cycle_id: model.text(),
  
  // Reference to the exchange (incoming or outgoing)
  exchange_id: model.text().nullable(),
  
  // Product variant ID (linked via module link to Medusa Product)
  variant_id: model.text(),
  
  // Seller who owns/supplies this product
  seller_id: model.text(),
  
  // Quantity available in this cycle (null = unlimited)
  available_quantity: model.number().nullable(),
  
  // Quantity sold in this cycle (tracked)
  sold_quantity: model.number().default(0),
  
  // Price override for this cycle (null = use default variant price)
  // Stored in cents
  override_price: model.bigNumber().nullable(),
  
  // Whether this product is visible in this cycle
  is_visible: model.boolean().default(true),
  
  // Display order within the cycle
  display_order: model.number().default(0),
  
  // Metadata for extensions
  metadata: model.json().nullable(),
})
.indexes([
  {
    name: "IDX_OCP_ORDER_CYCLE_ID",
    on: ["order_cycle_id"],
  },
  {
    name: "IDX_OCP_EXCHANGE_ID",
    on: ["exchange_id"],
  },
  {
    name: "IDX_OCP_VARIANT_ID",
    on: ["variant_id"],
  },
  {
    name: "IDX_OCP_SELLER_ID",
    on: ["seller_id"],
  },
  {
    name: "IDX_OCP_CYCLE_VARIANT",
    on: ["order_cycle_id", "variant_id"],
    unique: true,
  },
])

export default OrderCycleProduct
