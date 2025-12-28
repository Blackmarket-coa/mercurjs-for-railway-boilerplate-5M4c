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
    // Verify seller has access to this product via seller_product relationship
    const { data: sellerProducts } = await query.graph({
      entity: "seller_product",
      fields: ["product.*"],
      filters: {
        seller_id: sellerId,
        product_id: id
      }
    })

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.status(404).json({ message: "Product not found or access denied" })
    }

    const product = sellerProducts[0].product

    res.json({
      product
    })
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.status(500).json({ message: "Failed to fetch product", error: error.message })
  }
}
