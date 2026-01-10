import { model } from "@medusajs/framework/utils"
import ShopperWishlist from "./wishlist"

/**
 * ShopperWishlistItem Model
 *
 * Represents a product in a customer's wishlist.
 * Uses product_id (not variant_id) to match storefront expectations.
 *
 * Named "shopper_wishlist_item" to avoid naming conflict with Customer module.
 */
const ShopperWishlistItem = model.define("shopper_wishlist_item", {
  id: model.id().primaryKey(),
  product_id: model.text(),
  wishlist: model.belongsTo(() => ShopperWishlist, {
    mappedBy: "items",
  }),
})
.indexes([
  {
    on: ["product_id", "wishlist_id"],
    unique: true,
  },
])

export default ShopperWishlistItem
