import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/cms-types
 * List all active CMS types for storefront navigation
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: types } = await query.graph({
    entity: "cms_type",
    fields: [
      "id",
      "handle",
      "name",
      "description",
      "icon",
      "display_order",
    ],
    filters: {
      is_active: true,
      deleted_at: null,
    },
  })

  // Sort by display_order
  const sortedTypes = types.sort((a: any, b: any) => a.display_order - b.display_order)

  return res.json({
    types: sortedTypes,
  })
}
