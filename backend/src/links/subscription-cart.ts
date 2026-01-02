import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import CartModule from "@medusajs/medusa/cart"

/**
 * Link subscriptions to their original cart
 * Used to recreate orders for subscription renewals
 */
export default defineLink(
  SubscriptionModule.linkable.subscription,
  CartModule.linkable.cart
)
