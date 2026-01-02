import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import CustomerModule from "@medusajs/medusa/customer"

/**
 * Link customers to their subscriptions
 * A customer can have multiple subscriptions
 */
export default defineLink(
  {
    linkable: SubscriptionModule.linkable.subscription.id,
    isList: true
  },
  CustomerModule.linkable.customer
)
