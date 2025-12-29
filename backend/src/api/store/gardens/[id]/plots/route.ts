import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GARDEN_MODULE } from "../../../../modules/garden"

/**
 * GET /store/gardens/:id/plots
 * 
 * List all plots in a garden
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: plots } = await query.graph({
    entity: "plot",
    fields: [
      "id",
      "plot_number",
      "size_sqft",
      "soil_zone_id",
      "status",
      "sun_exposure",
      "irrigation_type",
      "raised_bed",
      "price_per_season",
      "current_assignee_id",
      "assignment_start",
      "assignment_end",
    ],
    filters: {
      garden_id: id,
    },
  })

  res.json({ plots })
}

/**
 * POST /store/gardens/:id/plots
 * 
 * Create a new plot in a garden
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const gardenService = req.scope.resolve(GARDEN_MODULE)

  const {
    plot_number,
    size_sqft,
    soil_zone_id,
    sun_exposure,
    irrigation_type,
    raised_bed,
    price_per_season,
  } = req.body as any

  const plot = await gardenService.createPlots({
    garden_id: id,
    plot_number,
    size_sqft,
    soil_zone_id,
    sun_exposure,
    irrigation_type: irrigation_type || "manual",
    raised_bed: raised_bed || false,
    price_per_season,
    status: "available",
  })

  // Update garden plot count
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: [garden] } = await query.graph({
    entity: "garden",
    fields: ["id", "total_plots", "available_plots"],
    filters: { id },
  })

  if (garden) {
    await gardenService.updateGardens({
      id,
      total_plots: (garden.total_plots || 0) + 1,
      available_plots: (garden.available_plots || 0) + 1,
    })
  }

  res.status(201).json({ plot })
}
