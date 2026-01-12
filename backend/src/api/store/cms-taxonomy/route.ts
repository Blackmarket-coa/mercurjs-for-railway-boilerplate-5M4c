import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/cms-taxonomy
 * Get the complete CMS taxonomy tree for navigation
 * Returns all types with their categories for building navigation menus
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // Get all active types
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

  // Get all active categories
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
    filters: {
      is_active: true,
      deleted_at: null,
    },
  })

  // Build the taxonomy tree
  const sortedTypes = types.sort((a: any, b: any) => a.display_order - b.display_order)

  const taxonomy = sortedTypes.map((type: any) => {
    const typeCategories = categories
      .filter((cat: any) => cat.type_id === type.id)
      .sort((a: any, b: any) => a.display_order - b.display_order)

    return {
      ...type,
      categories: typeCategories,
    }
  })

  return res.json({
    taxonomy,
    total_types: types.length,
    total_categories: categories.length,
  })
}
