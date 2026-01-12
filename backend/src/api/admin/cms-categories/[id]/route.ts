import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CMS_BLUEPRINT_MODULE } from "../../../../modules/cms-blueprint"

/**
 * GET /admin/cms-categories/:id
 * Get a single CMS category with its tags and attributes
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
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
      "is_active",
      "metadata",
      "created_at",
      "updated_at",
    ],
    filters: {
      id,
      deleted_at: null,
    },
  })

  if (!categories || categories.length === 0) {
    return res.status(404).json({ message: "CMS category not found" })
  }

  // Get tags for this category
  const { data: categoryTags } = await query.graph({
    entity: "cms_category_tag",
    fields: ["id", "tag_id", "is_default", "display_order"],
    filters: {
      category_id: id,
      deleted_at: null,
    },
  })

  // Get tag details
  const tagIds = categoryTags.map((ct: any) => ct.tag_id)
  let tags: any[] = []
  if (tagIds.length > 0) {
    const { data: tagData } = await query.graph({
      entity: "cms_tag",
      fields: ["id", "handle", "name", "tag_type", "color", "icon"],
      filters: {
        id: tagIds,
        deleted_at: null,
      },
    })
    tags = tagData
  }

  // Get attributes for this category
  const { data: categoryAttributes } = await query.graph({
    entity: "cms_category_attribute",
    fields: ["id", "attribute_id", "is_required", "display_order"],
    filters: {
      category_id: id,
      deleted_at: null,
    },
  })

  // Get attribute details
  const attributeIds = categoryAttributes.map((ca: any) => ca.attribute_id)
  let attributes: any[] = []
  if (attributeIds.length > 0) {
    const { data: attrData } = await query.graph({
      entity: "cms_attribute",
      fields: [
        "id",
        "handle",
        "name",
        "description",
        "input_type",
        "display_type",
        "unit",
        "options",
        "validation",
        "is_filterable",
      ],
      filters: {
        id: attributeIds,
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
    })
  }

  return res.json({
    category: {
      ...categories[0],
      tags,
      attributes: attributes.sort((a: any, b: any) => a.display_order - b.display_order),
    },
  })
}

/**
 * PUT /admin/cms-categories/:id
 * Update a CMS category
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const cmsBlueprintService = req.scope.resolve(CMS_BLUEPRINT_MODULE)

  const { type_id, handle, name, description, icon, image_url, display_order, is_active, metadata } = req.body as {
    type_id?: string
    handle?: string
    name?: string
    description?: string
    icon?: string
    image_url?: string
    display_order?: number
    is_active?: boolean
    metadata?: Record<string, unknown>
  }

  const category = await cmsBlueprintService.updateCmsCategories({
    id,
    type_id,
    handle,
    name,
    description,
    icon,
    image_url,
    display_order,
    is_active,
    metadata,
  })

  return res.json({ category })
}

/**
 * DELETE /admin/cms-categories/:id
 * Soft delete a CMS category
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const cmsBlueprintService = req.scope.resolve(CMS_BLUEPRINT_MODULE)

  await cmsBlueprintService.softDeleteCmsCategories(id)

  return res.status(200).json({
    id,
    deleted: true,
  })
}
