import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { VOLUNTEER_MODULE } from "../../modules/volunteer"
import { GARDEN_MODULE } from "../../modules/garden"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GardenLedgerService } from "../../modules/garden/services/garden-ledger"

/**
 * Log Volunteer Hours Workflow
 * 
 * Records volunteer hours and calculates time credits.
 */

type LogVolunteerHoursInput = {
  garden_id: string
  customer_id: string
  membership_id: string
  activity_type: string
  description: string
  date: Date
  hours: number
  work_party_id?: string
  plot_id?: string
}

const logVolunteerHoursStep = createStep(
  "log-volunteer-hours-step",
  async (input: LogVolunteerHoursInput, { container }) => {
    const volunteerService = container.resolve(VOLUNTEER_MODULE)
    const gardenService = container.resolve(GARDEN_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Get base credit rate
    let creditRate = 15 // Default $15/hour
    let creditMultiplier = 1.0

    // Check for work party bonus
    if (input.work_party_id) {
      const { data: [workParty] } = await query.graph({
        entity: "work_party",
        fields: ["id", "credit_multiplier"],
        filters: { id: input.work_party_id },
      })

      if (workParty?.credit_multiplier) {
        creditMultiplier = workParty.credit_multiplier
      }
    }

    const creditsEarned = GardenLedgerService.calculateTimeCreditValue(
      input.hours * creditMultiplier,
      creditRate
    )

    // Create volunteer log
    const log = await volunteerService.createVolunteerLogs({
      garden_id: input.garden_id,
      customer_id: input.customer_id,
      membership_id: input.membership_id,
      activity_type: input.activity_type,
      description: input.description,
      date: input.date,
      hours: input.hours,
      verification_status: "pending",
      credit_rate: creditRate,
      credit_multiplier: creditMultiplier,
      credits_earned: creditsEarned,
      work_party_id: input.work_party_id,
      plot_id: input.plot_id,
    })

    // Update membership labor hours (will be finalized upon verification)
    const { data: [membership] } = await query.graph({
      entity: "garden_membership",
      fields: ["id", "total_labor_hours"],
      filters: { id: input.membership_id },
    })

    if (membership) {
      await gardenService.updateGardenMemberships({
        id: input.membership_id,
        total_labor_hours: (membership.total_labor_hours || 0) + input.hours,
      })
    }

    return new StepResponse({
      log_id: log.id,
      hours: input.hours,
      credits_earned: creditsEarned,
      status: "pending",
    }, {
      logId: log.id,
      membershipId: input.membership_id,
      hours: input.hours,
    })
  },
  async (context, { container }) => {
    if (!context) return
    
    const volunteerService = container.resolve(VOLUNTEER_MODULE)
    const gardenService = container.resolve(GARDEN_MODULE)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    
    // Delete log
    await volunteerService.deleteVolunteerLogs(context.logId)
    
    // Revert membership hours
    const { data: [membership] } = await query.graph({
      entity: "garden_membership",
      fields: ["id", "total_labor_hours"],
      filters: { id: context.membershipId },
    })

    if (membership) {
      await gardenService.updateGardenMemberships({
        id: context.membershipId,
        total_labor_hours: Math.max(0, (membership.total_labor_hours || 0) - context.hours),
      })
    }
  }
)

export const logVolunteerHoursWorkflow = createWorkflow(
  "log-volunteer-hours-workflow",
  (input: LogVolunteerHoursInput) => {
    const result = logVolunteerHoursStep(input)
    return new WorkflowResponse(result)
  }
)
