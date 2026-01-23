import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type RouteParams = {
  id: string
}

/**
 * GET /admin/sellers/:id/products
 *
 * Get all products for a specific seller
 */
export const GET = async (
  req: MedusaRequest<unknown, RouteParams>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get requested fields or use defaults
  const requestedFields = req.query.fields as string | undefined
  const fields = requestedFields
    ? requestedFields.split(",").map((f) => f.trim())
    : ["*"]

  // First verify the seller exists
  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: ["id"],
    filters: { id },
  })

  if (!sellers || sellers.length === 0) {
    return res.status(404).json({
      message: `Seller with ID ${id} not found`,
    })
  }

  // Get all products for this seller
  const { data: products, metadata } = await query.graph({
    entity: "product",
    fields,
    filters: {
      seller_id: id,
    },
    pagination: {
      skip: req.query.offset ? Number(req.query.offset) : 0,
      take: req.query.limit ? Number(req.query.limit) : 50,
    },
  })

  return res.json({
    products: products || [],
    count: metadata?.count || 0,
    limit: metadata?.take || 50,
    offset: metadata?.skip || 0,
  })
}
