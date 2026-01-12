import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CMS_BLUEPRINT_MODULE } from "../../../../modules/cms-blueprint"

/**
 * GET /admin/cms-tags/:id
 * Get a single CMS tag
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: tags } = await query.graph({
    entity: "cms_tag",
    fields: [
      "id",
      "handle",
      "name",
      "description",
      "tag_type",
      "icon",
      "color",
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

  if (!tags || tags.length === 0) {
    return res.status(404).json({ message: "CMS tag not found" })
  }

  return res.json({ tag: tags[0] })
}

/**
 * PUT /admin/cms-tags/:id
 * Update a CMS tag
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const cmsBlueprintService = req.scope.resolve(CMS_BLUEPRINT_MODULE)

  const { handle, name, description, tag_type, icon, color, is_active, metadata } = req.body as {
    handle?: string
    name?: string
    description?: string
    tag_type?: string
    icon?: string
    color?: string
    is_active?: boolean
    metadata?: Record<string, unknown>
  }

  const tag = await cmsBlueprintService.updateCmsTags({
    id,
    handle,
    name,
    description,
    tag_type,
    icon,
    color,
    is_active,
    metadata,
  })

  return res.json({ tag })
}

/**
 * DELETE /admin/cms-tags/:id
 * Soft delete a CMS tag
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const cmsBlueprintService = req.scope.resolve(CMS_BLUEPRINT_MODULE)

  await cmsBlueprintService.softDeleteCmsTags(id)

  return res.status(200).json({
    id,
    deleted: true,
  })
}
