import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve("query")
  const sellerId = (req as any).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    // Get products for this seller via seller_product relationship
    const { data: sellerProducts } = await query.graph({
      entity: "seller_product",
      fields: ["product.*"],
      filters: {
        seller_id: sellerId
      },
      ...req.queryConfig,
    })

    // Extract products from seller_product results
    const products = sellerProducts.map((sp: any) => sp.product)

    res.json({
      products,
      count: sellerProducts.length
    })
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message })
  }
}
