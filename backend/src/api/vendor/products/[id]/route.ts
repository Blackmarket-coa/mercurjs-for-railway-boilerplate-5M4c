import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  const sellerId = (req as any).auth_context?.actor_id
  const { id } = req.params

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" })
  }

  try {
    // First verify the seller_product link exists
    const { data: sellerProducts } = await query.graph({
      entity: "seller_product",
      fields: ["product_id"],
      filters: {
        product_id: id,
        seller_id: sellerId
      }
    })

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.status(404).json({ 
        message: "Product not found or access denied",
        details: `No seller_product link found for product ${id} and seller ${sellerId}`
      })
    }

    // Now fetch the full product
    const { data: products } = await query.graph({
      entity: "product",
      fields: ["id", "title", "handle", "status", "variants.*", "variants.inventory_items.*"],
      filters: {
        id: id
      }
    })

    if (products && products.length > 0) {
      return res.json({
        product: products[0]
      })
    }

    return res.status(404).json({ message: "Product not found" })
  } catch (error: any) {
    console.error(`Error fetching product ${id} for seller ${sellerId}:`, error)
    res.status(500).json({ 
      message: "Failed to fetch product", 
      error: error.message 
    })
  }
}
