import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { VOLUNTEER_MODULE } from "../../../../../modules/volunteer"

/**
 * GET /store/work-parties/:id/signups
 * 
 * Get signups for a work party
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: signups } = await query.graph({
    entity: "work_party_signup",
    fields: [
      "id",
      "customer_id",
      "membership_id",
      "status",
      "signed_up_at",
      "check_in_time",
      "check_out_time",
      "actual_hours",
      "notes",
    ],
    filters: {
      work_party_id: id,
    },
  })

  res.json({ signups })
}

/**
 * POST /store/work-parties/:id/signups
 * 
 * Sign up for a work party
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const volunteerService = req.scope.resolve(VOLUNTEER_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { customer_id, membership_id, notes } = req.body as any

  // Check capacity
  const { data: [workParty] } = await query.graph({
    entity: "work_party",
    fields: ["id", "max_participants", "current_signups", "status"],
    filters: { id },
  })

  if (!workParty) {
    res.status(404).json({ message: "Work party not found" })
    return
  }

  if (workParty.status !== "scheduled") {
    res.status(400).json({ message: "Work party is not open for signups" })
    return
  }

  if (workParty.max_participants && workParty.current_signups >= workParty.max_participants) {
    res.status(400).json({ message: "Work party is at capacity" })
    return
  }

  const signup = await volunteerService.createWorkPartySignups({
    work_party_id: id,
    customer_id,
    membership_id,
    status: "signed_up",
    signed_up_at: new Date(),
    notes,
  })

  // Update signup count
  await volunteerService.updateWorkPartys({
    id,
    current_signups: workParty.current_signups + 1,
  })

  res.status(201).json({ signup })
}
