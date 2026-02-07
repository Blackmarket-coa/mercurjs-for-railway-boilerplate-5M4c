import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { getCollectiveHawalaService } from "../../services/collective-hawala"

type EscrowFundsInput = {
  demand_post_id: string
  participant_id: string
  customer_id: string
  amount: number
}

const escrowFundsStep = createStep(
  "escrow-participant-funds-step",
  async (input: EscrowFundsInput, { container }) => {
    const hawalaService = getCollectiveHawalaService(container)

    const entry = await hawalaService.escrowParticipantFunds({
      demand_post_id: input.demand_post_id,
      participant_id: input.participant_id,
      customer_id: input.customer_id,
      amount: input.amount,
    })

    return new StepResponse(entry, {
      demand_post_id: input.demand_post_id,
      participant_id: input.participant_id,
      customer_id: input.customer_id,
    })
  },
  async (context, { container }) => {
    if (!context) return
    const hawalaService = getCollectiveHawalaService(container)
    await hawalaService.releaseParticipantEscrow({
      demand_post_id: context.demand_post_id,
      participant_id: context.participant_id,
      customer_id: context.customer_id,
    })
  }
)

export const escrowFundsWorkflow = createWorkflow(
  "escrow-participant-funds-workflow",
  (input: EscrowFundsInput) => {
    const entry = escrowFundsStep(input)
    return new WorkflowResponse(entry)
  }
)
