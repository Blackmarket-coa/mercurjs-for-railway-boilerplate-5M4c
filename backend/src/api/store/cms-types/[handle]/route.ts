import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/cms-types/:handle
 * Get a single CMS type by handle with its categories
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
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
      handle,
      is_active: true,
      deleted_at: null,
    },
  })

  if (!types || types.length === 0) {
    return res.status(404).json({ message: "CMS type not found" })
  }

  const type = types[0]

  // Get categories for this type
  const { data: categories } = await query.graph({
    entity: "cms_category",
    fields: [
      "id",
      "handle",
      "name",
      "description",
      "icon",
      "image_url",
      "display_order",
    ],
    filters: {
      type_id: type.id,
      is_active: true,
      deleted_at: null,
    },
  })

  const sortedCategories = categories.sort((a: any, b: any) => a.display_order - b.display_order)

  return res.json({
    type: {
      ...type,
      categories: sortedCategories,
    },
  })
}
