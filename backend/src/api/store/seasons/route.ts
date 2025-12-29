import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { SEASON_MODULE } from "../../../modules/season"

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

  const filters: any = {}
  if (garden_id) filters.garden_id = garden_id
  if (status) filters.status = status

  const { data: seasons } = await query.graph({
    entity: "growing_season",
    fields: [
      "id",
      "garden_id",
      "name",
      "season_type",
      "start_date",
      "end_date",
      "status",
      "growing_plan_id",
      "goals",
      "actual_results",
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
  const seasonService = req.scope.resolve(SEASON_MODULE)

  const {
    garden_id,
    name,
    season_type,
    start_date,
    end_date,
    growing_plan_id,
    goals,
  } = req.body as any

  const season = await seasonService.createGrowingSeasons({
    garden_id,
    name,
    season_type,
    start_date: new Date(start_date),
    end_date: new Date(end_date),
    status: "planning",
    growing_plan_id,
    goals,
  })

  res.status(201).json({ season })
}
