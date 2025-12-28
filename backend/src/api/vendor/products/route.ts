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
    // Fetch products linked to this seller via seller_product
    const { data: sellerProducts } = await query.graph({
      entity: "seller_product",
      fields: ["product.*"],
      filters: {
        seller_id: sellerId
      },
    })

    const products = sellerProducts.map((sp: any) => sp.product)

    res.json({
      products,
      count: products.length
    })
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message })
  }
}
