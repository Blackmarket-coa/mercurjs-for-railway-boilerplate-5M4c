import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const remoteLink = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK)
  const sellerId = (req as any)._seller_id || (req as any).auth_context?.actor_id

  if (!sellerId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Resolve actual seller ID if we have a member ID
  let resolvedSellerId = sellerId
  if (sellerId.startsWith("mem_")) {
    try {
      const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
      const memberResult = await pgConnection.raw(
        `SELECT seller_id FROM member WHERE id = ? LIMIT 1`,
        [sellerId]
      )
      resolvedSellerId = memberResult.rows?.[0]?.seller_id || sellerId
    } catch {
      // Continue with original ID
    }
  }

  try {
    const { additional_data, ...productData } = req.body as any

    const { result } = await createProductsWorkflow(req.scope).run({
      input: {
        products: [productData],
        additional_data,
      },
    })

    const createdProduct = result[0]

    try {
      await remoteLink.create({
        "seller": { seller_id: resolvedSellerId },
        "product": { product_id: createdProduct.id },
      })
    } catch (linkError: any) {
      console.warn(
        `Could not create seller-product link for ${createdProduct.id}: ${linkError.message}`
      )
    }

    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id", "title", "subtitle", "status", "description", "handle",
        "thumbnail", "collection_id", "type_id", "metadata",
        "images.*", "variants.*", "variants.prices.*",
      ],
      filters: { id: createdProduct.id },
    })

    return res.json({
      product: products?.[0] || createdProduct,
    })
  } catch (error: any) {
    console.error(`Error creating product for seller ${resolvedSellerId}:`, error)
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    })
  }
}
