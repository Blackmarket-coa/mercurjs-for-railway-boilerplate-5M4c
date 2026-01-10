import { model } from "@medusajs/framework/utils"
import Wishlist from "./wishlist"

/**
 * WishlistItem Model
 *
 * Represents a product in a customer's wishlist.
 * Uses product_id (not variant_id) to match storefront expectations.
 */
const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  wishlist: model.belongsTo(() => Wishlist, {
    mappedBy: "items",
  }),
})
.indexes([
  {
    on: ["product_id", "wishlist_id"],
    unique: true,
  },
])

export default WishlistItem
