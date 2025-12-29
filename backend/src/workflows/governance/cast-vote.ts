import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GOVERNANCE_MODULE } from "../../modules/governance"
import { GardenLedgerService } from "../../modules/garden/services/garden-ledger"

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
    const governanceService = container.resolve(GOVERNANCE_MODULE)
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

    if (new Date() > new Date(proposal.voting_end)) {
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
    const voting_power = GardenLedgerService.calculateVotingPower({
      governance_model: garden.governance_model,
      base_votes: 1,
      labor_hours: membership?.total_labor_hours || 0,
      investment_amount: membership?.total_investment || 0,
      role_bonus: 0,
      weights: garden.voting_weights,
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
        labor_hours: membership?.total_labor_hours || 0,
        investment: membership?.total_investment || 0,
      },
      comment: input.comment,
      comment_visibility: input.comment_visibility || "public",
      is_delegated: false,
      is_final: true,
      voted_at: new Date(),
    })

    // Update proposal counts
    const voteUpdates: any = {
      id: input.proposal_id,
      total_voting_power: proposal.total_voting_power + voting_power,
      unique_voters: proposal.unique_voters + 1,
    }

    if (input.vote === "for") {
      voteUpdates.votes_for = proposal.votes_for + voting_power
    } else if (input.vote === "against") {
      voteUpdates.votes_against = proposal.votes_against + voting_power
    } else {
      voteUpdates.votes_abstain = proposal.votes_abstain + voting_power
    }

    await governanceService.updateGardenProposals(voteUpdates)

    return new StepResponse(vote, { voteId: vote.id, proposalId: input.proposal_id })
  },
  async (context, { container }) => {
    if (!context) return
    
    const governanceService = container.resolve(GOVERNANCE_MODULE)
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
