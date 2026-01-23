import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

type RouteParams = {
  id: string
}

/**
 * GET /admin/sellers/:id
 *
 * Get a single seller with seller_metadata (vendor_type, certifications, etc.)
 * and producer information if available.
 */
export const GET = async (
  req: MedusaRequest<unknown, RouteParams>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Allow custom field selection via query params
  const requestedFields = req.query.fields as string | undefined

  // Default fields to include all seller info + metadata + producer
  const fields = requestedFields
    ? requestedFields.split(",").map((f) => f.trim())
    : [
        "id",
        "name",
        "email",
        "phone",
        "description",
        "handle",
        "address_line",
        "city",
        "postal_code",
        "country_code",
        "tax_id",
        "store_status",
        "created_at",
        "updated_at",
        // Include seller_metadata
        "seller_metadata.*",
        // Include producer if exists
        "producer.*",
      ]

  const { data: sellers } = await query.graph({
    entity: "seller",
    fields,
    filters: { id },
  })

  const seller = sellers?.[0]

  if (!seller) {
    return res.status(404).json({
      message: `Seller with ID ${id} not found`,
    })
  }

  return res.json({ seller })
}
