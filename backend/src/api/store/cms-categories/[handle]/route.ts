import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * GET /store/cms-categories/:handle
 * Get a single CMS category by handle with its tags and filterable attributes
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { handle } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

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
      handle,
      is_active: true,
      deleted_at: null,
    },
  })

  if (!categories || categories.length === 0) {
    return res.status(404).json({ message: "CMS category not found" })
  }

  const category = categories[0]

  // Get the parent type
  const { data: types } = await query.graph({
    entity: "cms_type",
    fields: ["id", "handle", "name", "icon"],
    filters: {
      id: category.type_id,
      deleted_at: null,
    },
  })

  // Get tags for this category
  const { data: categoryTags } = await query.graph({
    entity: "cms_category_tag",
    fields: ["tag_id", "is_default"],
    filters: {
      category_id: category.id,
      deleted_at: null,
    },
  })

  const tagIds = categoryTags.map((ct: any) => ct.tag_id)
  let tags: any[] = []
  if (tagIds.length > 0) {
    const { data: tagData } = await query.graph({
      entity: "cms_tag",
      fields: ["id", "handle", "name", "tag_type", "color", "icon"],
      filters: {
        id: tagIds,
        is_active: true,
        deleted_at: null,
      },
    })
    // Group tags by type for easier frontend rendering
    tags = tagData.map((tag: any) => {
      const mapping = categoryTags.find((ct: any) => ct.tag_id === tag.id)
      return {
        ...tag,
        is_default: mapping?.is_default || false,
      }
    })
  }

  // Get filterable attributes for this category
  const { data: categoryAttributes } = await query.graph({
    entity: "cms_category_attribute",
    fields: ["attribute_id", "is_required", "display_order"],
    filters: {
      category_id: category.id,
      deleted_at: null,
    },
  })

  const attributeIds = categoryAttributes.map((ca: any) => ca.attribute_id)
  let attributes: any[] = []
  if (attributeIds.length > 0) {
    const { data: attrData } = await query.graph({
      entity: "cms_attribute",
      fields: [
        "id",
        "handle",
        "name",
        "input_type",
        "display_type",
        "unit",
        "options",
        "is_filterable",
      ],
      filters: {
        id: attributeIds,
        is_active: true,
        is_filterable: true,
        deleted_at: null,
      },
    })
    attributes = attrData.map((attr: any) => {
      const mapping = categoryAttributes.find((ca: any) => ca.attribute_id === attr.id)
      return {
        ...attr,
        is_required: mapping?.is_required || false,
        display_order: mapping?.display_order || 0,
      }
    }).sort((a: any, b: any) => a.display_order - b.display_order)
  }

  // Group tags by type for filter sidebar
  const tagsByType = tags.reduce((acc: Record<string, any[]>, tag: any) => {
    const type = tag.tag_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(tag)
    return acc
  }, {})

  return res.json({
    category: {
      ...category,
      type: types[0] || null,
      tags,
      tags_by_type: tagsByType,
      filterable_attributes: attributes,
    },
  })
}
