import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

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

/**
 * POST /admin/sellers/:id
 *
 * Update seller information
 */
export const POST = async (
  req: MedusaRequest<{
    name?: string
    email?: string
    phone?: string
    description?: string
    handle?: string
    address_line?: string
    city?: string
    postal_code?: string
    country_code?: string
    tax_id?: string
    store_status?: string
  }, RouteParams>,
  res: MedusaResponse
) => {
  const { id } = req.params
  const sellerModule = req.scope.resolve(Modules.SELLER)

  try {
    const updateData: Record<string, unknown> = { id }

    // Only include fields that are provided
    const fields = [
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
    ]

    for (const field of fields) {
      if (req.body[field as keyof typeof req.body] !== undefined) {
        updateData[field] = req.body[field as keyof typeof req.body]
      }
    }

    const updatedSeller = await sellerModule.updateSellers(updateData)

    // Fetch the updated seller with metadata
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: sellers } = await query.graph({
      entity: "seller",
      fields: [
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
        "seller_metadata.*",
        "producer.*",
      ],
      filters: { id },
    })

    return res.json({ seller: sellers?.[0] })
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error ? error.message : "Failed to update seller",
    })
  }
}
