import { defineLink } from "@medusajs/framework/utils"
import WishlistModule from "../modules/wishlist"
import ProductModule from "@medusajs/medusa/product"

/**
 * Link CustomerWishlistItem to Product
 *
 * Creates a read-only link between customer wishlist items and products
 * for querying purposes.
 */
export default defineLink(
  {
    linkable: WishlistModule.linkable.customerWishlistItem,
    field: "product_id",
  },
  ProductModule.linkable.product,
  {
    readOnly: true,
  }
)
