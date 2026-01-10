import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import CustomerModule from "@medusajs/medusa/customer"

/**
 * Link CustomerWishlist to Customer
 *
 * Creates a read-only link between customer wishlist and customer
 * for querying purposes.
 */
export default defineLink(
  {
    linkable: WishlistModule.linkable.customerWishlist,
    field: "customer_id",
  },
  CustomerModule.linkable.customer,
  {
    readOnly: true,
  }
)
