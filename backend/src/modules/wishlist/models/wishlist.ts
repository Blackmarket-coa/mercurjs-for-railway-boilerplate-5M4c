import { model } from "@medusajs/framework/utils"
import CustomerWishlistItem from "./wishlist-item"

/**
 * CustomerWishlist Model
 *
 * Represents a customer's wishlist. Each customer can have one wishlist
 * containing multiple products.
 *
 * Named "customer_wishlist" to avoid conflict with existing wishlist services.
 */
const CustomerWishlist = model.define("customer_wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  items: model.hasMany(() => CustomerWishlistItem, {
    mappedBy: "wishlist",
  }),
})
.indexes([
  {
    on: ["customer_id"],
    unique: true,
  },
])

export default CustomerWishlist
