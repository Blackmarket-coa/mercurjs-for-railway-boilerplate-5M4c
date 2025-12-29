import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const VOLUNTEER_MODULE = "volunteerModuleService"

interface VolunteerServiceType {
  createVolunteerLogs: (data: Record<string, unknown>) => Promise<{ id: string }>
}

// Inline credit calculation to avoid service import issues
function calculateTimeCreditValue(hours: number, creditRate: number): number {
  return hours * creditRate
}

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

  const filters: Record<string, unknown> = {}
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
  const volunteerService = req.scope.resolve(VOLUNTEER_MODULE) as VolunteerServiceType

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
  } = req.body as Record<string, unknown>

  // Calculate default credit rate
  const credit_rate = 15 // $15/hour default
  const credits_earned = calculateTimeCreditValue(hours as number, credit_rate)

  const log = await volunteerService.createVolunteerLogs({
    garden_id,
    customer_id,
    membership_id,
    activity_type,
    description,
    date: new Date(date as string),
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
