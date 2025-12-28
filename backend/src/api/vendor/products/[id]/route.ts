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
    // Try to fetch the product directly first
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

    // If not found, return 404
    return res.status(404).json({ message: "Product not found" })
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(500).json({ message: "Failed to fetch product", error: error.message })
  }
}
