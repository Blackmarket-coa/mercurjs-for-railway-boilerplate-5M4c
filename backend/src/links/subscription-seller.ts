import { defineLink } from "@medusajs/framework/utils"
import SubscriptionModule from "../modules/subscription"
import SellerModule from "@mercurjs/b2c-core/modules/seller"

/**
 * Link subscriptions to sellers
 * A seller can have multiple active subscriptions
 */
export default defineLink(
  {
    linkable: SubscriptionModule.linkable.subscription.id,
    isList: true
  },
  SellerModule.linkable.seller
)
