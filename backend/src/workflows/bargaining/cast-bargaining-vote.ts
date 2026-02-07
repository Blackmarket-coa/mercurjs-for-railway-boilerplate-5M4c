import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"

const BARGAINING_MODULE = "bargainingModuleService"

interface BargainingServiceType {
  voteOnGroupProposal: (data: {
    proposal_id: string
    group_id: string
    voter_id: string
    vote: "FOR" | "AGAINST" | "ABSTAIN"
    comment?: string
  }) => Promise<any>
  deleteBargainingVotes: (id: string) => Promise<void>
}

type CastBargainingVoteInput = {
  proposal_id: string
  group_id: string
  voter_id: string
  vote: "FOR" | "AGAINST" | "ABSTAIN"
  comment?: string
}

const castVoteStep = createStep(
  "cast-bargaining-vote-step",
  async (input: CastBargainingVoteInput, { container }) => {
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType

    const vote = await service.voteOnGroupProposal(input)
    return new StepResponse(vote, vote.id)
  },
  async (voteId, { container }) => {
    if (!voteId) return
    const service = container.resolve(BARGAINING_MODULE) as BargainingServiceType
    await service.deleteBargainingVotes(voteId)
  }
)

export const castBargainingVoteWorkflow = createWorkflow(
  "cast-bargaining-vote-workflow",
  (input: CastBargainingVoteInput) => {
    const vote = castVoteStep(input)
    return new WorkflowResponse(vote)
  }
)
