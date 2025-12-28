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
    // First try fetching via seller_product relationship
    try {
      const { data: sellerProducts } = await query.graph({
        entity: "seller_product",
        fields: ["product.*"],
        filters: {
          seller_id: sellerId
        },
      })

      const products = sellerProducts.map((sp: any) => sp.product)

      return res.json({
        products,
        count: sellerProducts.length
      })
    } catch (sellerProductError: any) {
      // If seller_product doesn't work, fall back to returning empty array
      // Products created by non-seller workflows may not have seller_product links
      if (sellerProductError.message?.includes("seller_product") || sellerProductError.message?.includes("not found")) {
        return res.json({
          products: [],
          count: 0
        })
      }
      throw sellerProductError
    }
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch products", error: error.message })
  }
}
