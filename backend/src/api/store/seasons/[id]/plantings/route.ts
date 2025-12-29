import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SEASON_MODULE } from "../../../../modules/season"

/**
 * GET /store/seasons/:id/plantings
 * 
 * List plantings for a season
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: plantings } = await query.graph({
    entity: "planting",
    fields: [
      "id",
      "plot_id",
      "crop_type",
      "variety",
      "planted_date",
      "expected_harvest_date",
      "actual_harvest_date",
      "status",
      "quantity_planted",
      "expected_yield",
      "actual_yield",
      "yield_unit",
      "quality_notes",
    ],
    filters: {
      season_id: id,
    },
  })

  res.json({ plantings })
}

/**
 * POST /store/seasons/:id/plantings
 * 
 * Record a new planting
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const seasonService = req.scope.resolve(SEASON_MODULE)

  const {
    plot_id,
    crop_type,
    variety,
    planted_by_id,
    planted_date,
    expected_harvest_date,
    quantity_planted,
    expected_yield,
    yield_unit,
    seed_source,
    organic_certified,
    notes,
  } = req.body as any

  const planting = await seasonService.createPlantings({
    season_id: id,
    plot_id,
    crop_type,
    variety,
    planted_by_id,
    planted_date: new Date(planted_date),
    expected_harvest_date: expected_harvest_date ? new Date(expected_harvest_date) : null,
    quantity_planted,
    expected_yield,
    yield_unit: yield_unit || "lbs",
    seed_source,
    organic_certified: organic_certified || false,
    status: "planted",
    notes,
  })

  res.status(201).json({ planting })
}
