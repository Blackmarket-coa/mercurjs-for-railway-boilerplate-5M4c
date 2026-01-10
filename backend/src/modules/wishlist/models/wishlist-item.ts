import { model } from "@medusajs/framework/utils"
import CustomerWishlist from "./wishlist"

/**
 * CustomerWishlistItem Model
 *
 * Represents a product in a customer's wishlist.
 * Uses product_id (not variant_id) to match storefront expectations.
 *
 * Named "customer_wishlist_item" to avoid conflict with existing wishlist services.
 */
const CustomerWishlistItem = model.define("customer_wishlist_item", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  wishlist: model.belongsTo(() => CustomerWishlist, {
    mappedBy: "items",
  }),
})
.indexes([
  {
    on: ["product_id", "wishlist_id"],
    unique: true,
  },
])

export default CustomerWishlistItem
