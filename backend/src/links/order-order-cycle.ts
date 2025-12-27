import { defineLink } from "@medusajs/framework/utils"
import OrderCycleModule from "../modules/order-cycle"
import OrderModule from "@medusajs/medusa/order"

/**
 * Link Order to Order Cycle
 * 
 * Associates Medusa orders with the order cycle they were placed in.
 * This enables:
 * - Tracking which orders belong to which cycle
 * - Generating packing lists per cycle
 * - Order cycle reporting and analytics
 */
export default defineLink(
  OrderModule.linkable.order,
  {
    linkable: OrderCycleModule.linkable.orderCycle,
    isList: false,
  }
)
