import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GARDEN_MODULE } from "../../../../modules/garden"

/**
 * GET /store/gardens/:id
 * 
 * Get a specific garden by ID
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [garden] } = await query.graph({
    entity: "garden",
    fields: [
      "id",
      "name",
      "slug",
      "description",
      "location.*",
      "size_sqft",
      "total_plots",
      "available_plots",
      "growing_zones",
      "membership_types",
      "governance_model",
      "voting_weights",
      "amenities",
      "contact_email",
      "contact_phone",
      "operating_hours",
      "image_urls",
      "status",
      "rules_document_url",
    ],
    filters: {
      id,
    },
  })

  if (!garden) {
    res.status(404).json({ message: "Garden not found" })
    return
  }

  res.json({ garden })
}

/**
 * PUT /store/gardens/:id
 * 
 * Update a garden
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const gardenService = req.scope.resolve(GARDEN_MODULE)

  const garden = await gardenService.updateGardens({
    id,
    ...req.body,
  })

  res.json({ garden })
}
