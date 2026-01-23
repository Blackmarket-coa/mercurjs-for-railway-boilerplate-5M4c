import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * GET /admin/sellers
 *
 * List all sellers with their seller_metadata (vendor_type, certifications, etc.)
 * and producer information if available.
 */
export const GET = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Build filters from query params
  const filters: Record<string, unknown> = {}

  if (req.query.q) {
    // Search by name or email
    filters.$or = [
      { name: { $ilike: `%${req.query.q}%` } },
      { email: { $ilike: `%${req.query.q}%` } },
    ]
  }

  if (req.query.store_status) {
    filters.store_status = req.query.store_status
  }

  // Get all sellers with their related seller_metadata and producer
  const { data: sellers, metadata } = await query.graph({
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
      // Include seller_metadata
      "seller_metadata.*",
      // Include producer if exists
      "producer.*",
    ],
    filters,
    pagination: {
      skip: req.query.offset ? Number(req.query.offset) : 0,
      take: req.query.limit ? Number(req.query.limit) : 20,
    },
  })

  return res.json({
    sellers,
    count: metadata?.count || 0,
    limit: metadata?.take || 20,
    offset: metadata?.skip || 0,
  })
}
