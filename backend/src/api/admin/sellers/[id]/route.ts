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

  // Default fields to include all seller info + metadata
  // Note: producer is linked via producer_seller link, not directly on seller entity
  const fields = requestedFields
    ? requestedFields.split(",").map((f) => f.trim()).filter((f) => !f.startsWith("producer."))
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

  // Fetch producer info via producer_seller link
  let producer = null
  try {
    const { data: producerLinks } = await query.graph({
      entity: "producer_seller",
      fields: ["producer.*"],
      filters: {
        seller_id: id,
      },
    })

    if (producerLinks && producerLinks.length > 0) {
      producer = producerLinks[0].producer || null
    }
  } catch {
    // producer_seller link may not exist for this seller, ignore errors
  }

  return res.json({
    seller: {
      ...seller,
      producer,
    }
  })
}
