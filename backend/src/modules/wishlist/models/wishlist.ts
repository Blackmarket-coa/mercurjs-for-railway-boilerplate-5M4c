import { model } from "@medusajs/framework/utils"
import ShopperWishlistItem from "./wishlist-item"

/**
 * ShopperWishlist Model
 *
 * Represents a customer's wishlist. Each customer can have one wishlist
 * containing multiple products.
 *
 * Named "shopper_wishlist" to avoid naming conflict with Customer module
 * which was causing alias collision errors.
 */
const ShopperWishlist = model.define("shopper_wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text(),
  items: model.hasMany(() => ShopperWishlistItem, {
    mappedBy: "wishlist",
  }),
})
.indexes([
  {
    on: ["customer_id"],
    unique: true,
  },
])

export default ShopperWishlist
