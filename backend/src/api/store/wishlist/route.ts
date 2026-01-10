import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { WISHLIST_MODULE } from "../../../modules/wishlist"
import WishlistModuleService from "../../../modules/wishlist/service"
import { requireCustomerId } from "../../../shared"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const addWishlistItemSchema = z.object({
  reference: z.literal("product"),
  reference_id: z.string().min(1, "Product ID is required"),
})

// ===========================================
// GET /store/wishlist
// Get customer's wishlists with products
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireCustomerId(req, res)
    if (!customerId) return

    const query = req.scope.resolve("query")

    // Query wishlists with items and linked products
    const { data: wishlists } = await query.graph({
      entity: "customer_wishlist",
      fields: ["id", "customer_id", "items.*", "items.product.*"],
      filters: {
        customer_id: customerId,
      },
    })

    // Transform data to match storefront expectations
    const transformedWishlists = wishlists.map((wishlist: any) => ({
      id: wishlist.id,
      products: (wishlist.items || [])
        .map((item: any) => item.product)
        .filter(Boolean),
    }))

    res.json({
      wishlists: transformedWishlists,
      count: transformedWishlists.length,
    })
  } catch (error) {
    throw error
  }
}

// ===========================================
// POST /store/wishlist
// Add a product to customer's wishlist
// ===========================================

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireCustomerId(req, res)
    if (!customerId) return

    const data = addWishlistItemSchema.parse(req.body)

    const wishlistService = req.scope.resolve<WishlistModuleService>(WISHLIST_MODULE)

    // Add product to wishlist (will create wishlist if it doesn't exist)
    const wishlist = await wishlistService.addProductToWishlist(
      customerId,
      data.reference_id
    )

    res.status(201).json({
      wishlist: {
        id: wishlist.id,
      },
      message: "Product added to wishlist",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}
