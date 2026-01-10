import { MedusaService } from "@medusajs/framework/utils"
import { Wishlist, WishlistItem } from "./models"

/**
 * Wishlist Module Service
 *
 * Provides CRUD operations for wishlists and wishlist items.
 * Supports the storefront wishlist feature where customers can save products.
 */
class WishlistModuleService extends MedusaService({
  Wishlist,
  WishlistItem,
}) {
  /**
   * Get or create a wishlist for a customer
   */
  async getOrCreateWishlist(customerId: string) {
    const existing = await this.listWishlists({
      customer_id: customerId,
    })

    if (existing.length > 0) {
      return existing[0]
    }

    return this.createWishlists({
      customer_id: customerId,
    })
  }

  /**
   * Add a product to a customer's wishlist
   */
  async addProductToWishlist(customerId: string, productId: string) {
    const wishlist = await this.getOrCreateWishlist(customerId)

    // Check if product already exists in wishlist
    const existingItems = await this.listWishlistItems({
      wishlist_id: wishlist.id,
      product_id: productId,
    })

    if (existingItems.length > 0) {
      return wishlist
    }

    await this.createWishlistItems({
      wishlist_id: wishlist.id,
      product_id: productId,
    })

    return wishlist
  }

  /**
   * Remove a product from a customer's wishlist
   */
  async removeProductFromWishlist(wishlistId: string, productId: string) {
    const items = await this.listWishlistItems({
      wishlist_id: wishlistId,
      product_id: productId,
    })

    if (items.length > 0) {
      await this.deleteWishlistItems(items[0].id)
    }

    return { success: true }
  }

  /**
   * Get wishlists for a customer with items
   */
  async getCustomerWishlists(customerId: string) {
    return this.listWishlists(
      { customer_id: customerId },
      { relations: ["items"] }
    )
  }
}

export default WishlistModuleService
