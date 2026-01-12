import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/cms-categories
 * List all active CMS categories with optional type filtering
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { type_handle } = req.query as { type_handle?: string }

  let typeId: string | undefined

  if (type_handle) {
    // Look up type by handle
    const { data: types } = await query.graph({
      entity: "cms_type",
      fields: ["id"],
      filters: {
        handle: type_handle,
        is_active: true,
        deleted_at: null,
      },
    })

    if (types && types.length > 0) {
      typeId = types[0].id
    } else {
      return res.json({ categories: [] })
    }
  }

  const filters: Record<string, any> = {
    is_active: true,
    deleted_at: null,
  }

  if (typeId) {
    filters.type_id = typeId
  }

  const { data: categories } = await query.graph({
    entity: "cms_category",
    fields: [
      "id",
      "type_id",
      "handle",
      "name",
      "description",
      "icon",
      "image_url",
      "display_order",
    ],
    filters,
  })

  // Sort by display_order
  const sortedCategories = categories.sort((a: any, b: any) => a.display_order - b.display_order)

  return res.json({
    categories: sortedCategories,
  })
}
