import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import OrderModule from "@medusajs/medusa/order"

/**
 * Link subscriptions to orders
 * A subscription can have multiple orders (one per renewal period)
 */
export default defineLink(
  SubscriptionModule.linkable.subscription,
  {
    linkable: OrderModule.linkable.order.id,
    isList: true
  }
)
