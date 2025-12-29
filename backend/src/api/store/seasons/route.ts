import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const SEASON_MODULE = "seasonModuleService"

interface SeasonServiceType {
  createGardenSeasons: (data: Record<string, unknown>) => Promise<{ id: string }>
}

/**
 * GET /store/seasons
 * 
 * List growing seasons
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { garden_id, status } = req.query

  const filters: Record<string, unknown> = {}
  if (garden_id) filters.garden_id = garden_id
  if (status) filters.status = status

  const { data: seasons } = await query.graph({
    entity: "garden_season",
    fields: [
      "id",
      "garden_id",
      "name",
      "season_type",
      "planning_start",
      "harvest_end",
      "status",
      "growing_plan_id",
      "goals",
    ],
    filters,
  })

  res.json({ seasons })
}

/**
 * POST /store/seasons
 * 
 * Create a new growing season
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const seasonService = req.scope.resolve(SEASON_MODULE) as SeasonServiceType

  const {
    garden_id,
    name,
    season_type,
    year,
    planning_start,
    planting_start,
    growing_start,
    harvest_start,
    harvest_end,
    growing_plan_id,
    goals,
  } = req.body as Record<string, unknown>

  const season = await seasonService.createGardenSeasons({
    garden_id,
    name,
    season_type,
    year: year || new Date().getFullYear(),
    planning_start: planning_start ? new Date(planning_start as string) : new Date(),
    planting_start: planting_start ? new Date(planting_start as string) : null,
    growing_start: growing_start ? new Date(growing_start as string) : null,
    harvest_start: harvest_start ? new Date(harvest_start as string) : null,
    harvest_end: harvest_end ? new Date(harvest_end as string) : null,
    status: "planning",
    growing_plan_id,
    goals,
  })

  res.status(201).json({ season })
}
