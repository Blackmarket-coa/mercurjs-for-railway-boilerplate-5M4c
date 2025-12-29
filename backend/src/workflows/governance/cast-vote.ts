import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const GOVERNANCE_MODULE = "governanceModuleService"

interface GovernanceServiceType {
  createGardenVotes: (data: Record<string, unknown>) => Promise<{ id: string }>
  updateGardenProposals: (data: Record<string, unknown>) => Promise<{ id: string }>
  deleteGardenVotes: (id: string) => Promise<void>
}

// Inline voting power calculation
function calculateVotingPower(params: {
  governance_model: string
  base_votes: number
  labor_hours: number
  investment_amount: number
  role_bonus: number
  weights?: { labor_weight?: number; investment_weight?: number } | null
}): number {
  const { governance_model, base_votes, labor_hours, investment_amount, weights } = params
  
  if (governance_model === "one_member_one_vote") {
    return 1
  }
  
  const laborWeight = weights?.labor_weight || 0.5
  const investmentWeight = weights?.investment_weight || 0.5
  
  const laborBonus = Math.floor(labor_hours / 10) * laborWeight
  const investmentBonus = Math.floor(investment_amount / 100) * investmentWeight
  
  return base_votes + laborBonus + investmentBonus
}

/**
 * Cast Vote Workflow
 * 
 * Casts a vote on a governance proposal.
 */

type CastVoteInput = {
  proposal_id: string
  customer_id: string
  membership_id: string
  vote: "for" | "against" | "abstain"
  comment?: string
  comment_visibility?: "public" | "members_only" | "private"
}

const validateAndCastVoteStep = createStep(
  "validate-and-cast-vote-step",
  async (input: CastVoteInput, { container }) => {
    const governanceService = container.resolve(GOVERNANCE_MODULE) as GovernanceServiceType
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // Get proposal
    const { data: [proposal] } = await query.graph({
      entity: "garden_proposal",
      fields: [
        "id", 
        "garden_id", 
        "status", 
        "voting_end",
        "votes_for",
        "votes_against", 
        "votes_abstain",
        "total_voting_power",
        "unique_voters"
      ],
      filters: { id: input.proposal_id },
    })

    if (!proposal) {
      throw new Error("Proposal not found")
    }

    if (proposal.status !== "active") {
      throw new Error("Voting is not open for this proposal")
    }

    if (new Date() > new Date(proposal.voting_end as string)) {
      throw new Error("Voting period has ended")
    }

    // Check for existing vote
    const { data: existingVotes } = await query.graph({
      entity: "garden_vote",
      fields: ["id"],
      filters: { proposal_id: input.proposal_id, customer_id: input.customer_id },
    })

    if (existingVotes.length > 0) {
      throw new Error("You have already voted on this proposal")
    }

    // Get membership and garden
    const { data: [membership] } = await query.graph({
      entity: "garden_membership",
      fields: ["id", "voting_power", "total_labor_hours", "total_investment"],
      filters: { id: input.membership_id },
    })

    const { data: [garden] } = await query.graph({
      entity: "garden",
      fields: ["id", "governance_model", "voting_weights"],
      filters: { id: proposal.garden_id },
    })

    // Calculate voting power
    const voting_power = calculateVotingPower({
      governance_model: garden.governance_model as string,
      base_votes: 1,
      labor_hours: (membership?.total_labor_hours as number) || 0,
      investment_amount: (membership?.total_investment as number) || 0,
      role_bonus: 0,
      weights: garden.voting_weights as { labor_weight?: number; investment_weight?: number } | null,
    })

    // Create vote
    const vote = await governanceService.createGardenVotes({
      proposal_id: input.proposal_id,
      garden_id: proposal.garden_id,
      customer_id: input.customer_id,
      membership_id: input.membership_id,
      vote: input.vote,
      voting_power,
      power_basis: {
        base: 1,
        labor_hours: (membership?.total_labor_hours as number) || 0,
        investment: (membership?.total_investment as number) || 0,
      },
      comment: input.comment,
      comment_visibility: input.comment_visibility || "public",
      is_delegated: false,
      is_final: true,
      voted_at: new Date(),
    })

    // Update proposal counts
    const votesFor = proposal.votes_for as number
    const votesAgainst = proposal.votes_against as number
    const votesAbstain = proposal.votes_abstain as number
    const totalVotingPower = proposal.total_voting_power as number
    const uniqueVoters = proposal.unique_voters as number

    const voteUpdates: Record<string, unknown> = {
      id: input.proposal_id,
      total_voting_power: totalVotingPower + voting_power,
      unique_voters: uniqueVoters + 1,
    }

    if (input.vote === "for") {
      voteUpdates.votes_for = votesFor + voting_power
    } else if (input.vote === "against") {
      voteUpdates.votes_against = votesAgainst + voting_power
    } else {
      voteUpdates.votes_abstain = votesAbstain + voting_power
    }

    await governanceService.updateGardenProposals(voteUpdates)

    return new StepResponse(vote, { voteId: vote.id, proposalId: input.proposal_id })
  },
  async (context, { container }) => {
    if (!context) return
    
    const governanceService = container.resolve(GOVERNANCE_MODULE) as GovernanceServiceType
    // Rollback would require reversing vote counts - simplified here
    await governanceService.deleteGardenVotes(context.voteId)
  }
)

export const castVoteWorkflow = createWorkflow(
  "cast-garden-vote-workflow",
  (input: CastVoteInput) => {
    const vote = validateAndCastVoteStep(input)
    return new WorkflowResponse(vote)
  }
)
