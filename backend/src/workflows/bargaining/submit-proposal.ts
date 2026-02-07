import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const BARGAINING_MODULE = "bargainingModuleService"

interface BargainingServiceType {
  submitGroupProposal: (data: Record<string, unknown>) => Promise<any>
  deleteBargainingProposals: (id: string) => Promise<void>
}

type SubmitProposalInput = {
  group_id: string
  proposer_id: string
  proposer_type?: string
  proposal_type?: string
  title: string
  description?: string
  terms: Record<string, unknown>
  unit_price?: number
  total_price?: number
  volume_tiers?: Array<{ min_qty: number; max_qty: number; unit_price: number }>
  fulfillment_timeline?: string
  valid_until?: Date
  parent_proposal_id?: string
}

const submitProposalStep = createStep(
  "submit-bargaining-proposal-step",
  async (input: SubmitProposalInput, { container }) => {
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType

    const proposal = await service.submitGroupProposal(input)
    return new StepResponse(proposal, proposal.id)
  },
  async (proposalId, { container }) => {
    if (!proposalId) return
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType
    await service.deleteBargainingProposals(proposalId)
  }
)

export const submitBargainingProposalWorkflow = createWorkflow(
  "submit-bargaining-proposal-workflow",
  (input: SubmitProposalInput) => {
    const proposal = submitProposalStep(input)
    return new WorkflowResponse(proposal)
  }
)
