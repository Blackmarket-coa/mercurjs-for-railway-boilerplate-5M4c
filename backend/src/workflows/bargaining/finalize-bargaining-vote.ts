import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const BARGAINING_MODULE = "bargainingModuleService"

interface BargainingServiceType {
  finalizeProposalVote: (proposalId: string) => Promise<any>
  updateBargainingProposals: (data: Record<string, unknown>) => Promise<any>
  updateBargainingGroups: (data: Record<string, unknown>) => Promise<any>
}

type FinalizeVoteInput = {
  proposal_id: string
}

const finalizeVoteStep = createStep(
  "finalize-bargaining-vote-step",
  async (input: FinalizeVoteInput, { container }) => {
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType

    const result = await service.finalizeProposalVote(input.proposal_id)
    return new StepResponse(result, {
      proposal_id: input.proposal_id,
      previous_accepted: result.accepted,
    })
  },
  async (context, { container }) => {
    if (!context) return
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType
    // Revert proposal to SUBMITTED status
    await service.updateBargainingProposals({
      id: context.proposal_id,
      status: "SUBMITTED",
      approval_percentage: null,
      voted_at: null,
      resolved_at: null,
    })
  }
)

export const finalizeBargainingVoteWorkflow = createWorkflow(
  "finalize-bargaining-vote-workflow",
  (input: FinalizeVoteInput) => {
    const result = finalizeVoteStep(input)
    return new WorkflowResponse(result)
  }
)
