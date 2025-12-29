import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { HARVEST_MODULE } from "../../../modules/harvest"
import { HarvestAllocationEngine } from "../../../modules/harvest/services/allocation-engine"

/**
 * GET /store/harvests
 * 
 * List harvests
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { garden_id, season_id, status } = req.query

  const filters: any = {}
  if (garden_id) filters.garden_id = garden_id
  if (season_id) filters.season_id = season_id
  if (status) filters.status = status

  const { data: harvests } = await query.graph({
    entity: "harvest",
    fields: [
      "id",
      "garden_id",
      "season_id",
      "planting_id",
      "crop_type",
      "variety",
      "quantity",
      "unit",
      "quality_grade",
      "estimated_value",
      "harvested_at",
      "harvested_by_id",
      "status",
      "allocation_status",
    ],
    filters,
  })

  res.json({ harvests })
}

/**
 * POST /store/harvests
 * 
 * Record a new harvest
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const harvestService = req.scope.resolve(HARVEST_MODULE)

  const {
    garden_id,
    season_id,
    planting_id,
    crop_type,
    variety,
    quantity,
    unit,
    quality_grade,
    price_per_unit,
    harvested_by_id,
    notes,
    storage_location,
    photos,
  } = req.body as any

  // Calculate estimated value
  const estimated_value = HarvestAllocationEngine.estimateHarvestValue(
    crop_type,
    quantity,
    unit,
    quality_grade || "standard",
    price_per_unit || 0
  )

  const harvest = await harvestService.createHarvests({
    garden_id,
    season_id,
    planting_id,
    crop_type,
    variety,
    quantity,
    unit: unit || "lbs",
    quality_grade: quality_grade || "standard",
    estimated_value,
    harvested_at: new Date(),
    harvested_by_id,
    status: "collected",
    allocation_status: "pending",
    notes,
    storage_location,
    photos,
  })

  res.status(201).json({ harvest })
}
