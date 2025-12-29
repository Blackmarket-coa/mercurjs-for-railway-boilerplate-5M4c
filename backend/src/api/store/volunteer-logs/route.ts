import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VOLUNTEER_MODULE } from "../../../modules/volunteer"
import { GardenLedgerService } from "../../../modules/garden/services/garden-ledger"

/**
 * GET /store/volunteer-logs
 * 
 * List volunteer logs
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { garden_id, customer_id, status } = req.query

  const filters: any = {}
  if (garden_id) filters.garden_id = garden_id
  if (customer_id) filters.customer_id = customer_id
  if (status) filters.verification_status = status

  const { data: logs } = await query.graph({
    entity: "volunteer_log",
    fields: [
      "id",
      "garden_id",
      "customer_id",
      "activity_type",
      "description",
      "date",
      "hours",
      "verification_status",
      "verified_by_id",
      "credit_rate",
      "credits_earned",
    ],
    filters,
  })

  res.json({ logs })
}

/**
 * POST /store/volunteer-logs
 * 
 * Log volunteer hours
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const volunteerService = req.scope.resolve(VOLUNTEER_MODULE)

  const {
    garden_id,
    customer_id,
    membership_id,
    activity_type,
    description,
    date,
    start_time,
    end_time,
    hours,
    work_party_id,
    plot_id,
  } = req.body as any

  // Calculate default credit rate
  const credit_rate = 15 // $15/hour default
  const credits_earned = GardenLedgerService.calculateTimeCreditValue(hours, credit_rate)

  const log = await volunteerService.createVolunteerLogs({
    garden_id,
    customer_id,
    membership_id,
    activity_type,
    description,
    date: new Date(date),
    start_time,
    end_time,
    hours,
    verification_status: "pending",
    credit_rate,
    credits_earned,
    work_party_id,
    plot_id,
  })

  res.status(201).json({ log })
}
