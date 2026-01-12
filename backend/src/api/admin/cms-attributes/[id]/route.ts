import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { CMS_BLUEPRINT_MODULE, CmsBlueprintServiceType } from "../../../../modules/cms-blueprint"

/**
 * GET /admin/cms-attributes/:id
 * Get a single CMS attribute
 */
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: attributes } = await query.graph({
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
      "is_required",
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

  if (!attributes || attributes.length === 0) {
    return res.status(404).json({ message: "CMS attribute not found" })
  }

  return res.json({ attribute: attributes[0] })
}

/**
 * PUT /admin/cms-attributes/:id
 * Update a CMS attribute
 */
export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const cmsBlueprintService = req.scope.resolve<CmsBlueprintServiceType>(CMS_BLUEPRINT_MODULE)

  const {
    handle,
    name,
    description,
    input_type,
    display_type,
    unit,
    options,
    validation,
    is_filterable,
    is_required,
    display_order,
    is_active,
    metadata,
  } = req.body as {
    handle?: string
    name?: string
    description?: string
    input_type?: string
    display_type?: string
    unit?: string
    options?: unknown
    validation?: unknown
    is_filterable?: boolean
    is_required?: boolean
    display_order?: number
    is_active?: boolean
    metadata?: Record<string, unknown>
  }

  const attribute = await cmsBlueprintService.updateCmsAttributes({
    id,
    handle,
    name,
    description,
    input_type,
    display_type,
    unit,
    options,
    validation,
    is_filterable,
    is_required,
    display_order,
    is_active,
    metadata,
  })

  return res.json({ attribute })
}

/**
 * DELETE /admin/cms-attributes/:id
 * Soft delete a CMS attribute
 */
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { id } = req.params
  const cmsBlueprintService = req.scope.resolve<CmsBlueprintServiceType>(CMS_BLUEPRINT_MODULE)

  await cmsBlueprintService.softDeleteCmsAttributes(id)

  return res.status(200).json({
    id,
    deleted: true,
  })
}
