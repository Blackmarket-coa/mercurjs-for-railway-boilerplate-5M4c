import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GARDEN_MODULE } from "../../../../modules/garden"

/**
 * GET /store/gardens/:id/members
 * 
 * List members of a garden
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: members } = await query.graph({
    entity: "garden_membership",
    fields: [
      "id",
      "customer_id",
      "membership_type",
      "status",
      "roles",
      "joined_at",
      "total_labor_hours",
      "total_investment",
      "voting_power",
    ],
    filters: {
      garden_id: id,
      status: ["active", "on_leave"],
    },
  })

  res.json({ members })
}

/**
 * POST /store/gardens/:id/members
 * 
 * Join a garden as a member
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const gardenService = req.scope.resolve(GARDEN_MODULE)

  const {
    customer_id,
    membership_type,
    initial_investment,
  } = req.body as any

  const membership = await gardenService.createGardenMemberships({
    garden_id: id,
    customer_id,
    membership_type: membership_type || "volunteer",
    status: "pending",
    roles: [],
    joined_at: new Date(),
    total_labor_hours: 0,
    total_investment: initial_investment || 0,
    time_credit_balance: 0,
    harvest_credit_balance: 0,
    voting_power: 1, // Base voting power
  })

  res.status(201).json({ membership })
}
