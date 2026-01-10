import { model } from "@medusajs/framework/utils"
import WishlistItem from "./wishlist-item"

/**
 * Wishlist Model
 *
 * Represents a customer's wishlist. Each customer can have one wishlist
 * containing multiple products.
 */
const Wishlist = model.define("wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  items: model.hasMany(() => WishlistItem, {
    mappedBy: "wishlist",
  }),
})
.indexes([
  {
    on: ["customer_id"],
    unique: true,
  },
])

export default Wishlist
