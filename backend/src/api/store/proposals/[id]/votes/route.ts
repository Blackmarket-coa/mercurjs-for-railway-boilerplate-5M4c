import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GOVERNANCE_MODULE } from "../../../../../modules/governance"
import { GARDEN_MODULE } from "../../../../../modules/garden"
import { GardenLedgerService } from "../../../../../modules/garden/services/garden-ledger"

/**
 * GET /store/proposals/:id/votes
 * 
 * Get votes for a proposal
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: votes } = await query.graph({
    entity: "garden_vote",
    fields: [
      "id",
      "customer_id",
      "vote",
      "voting_power",
      "comment",
      "comment_visibility",
      "voted_at",
      "is_delegated",
    ],
    filters: {
      proposal_id: id,
    },
  })

  res.json({ votes })
}

/**
 * POST /store/proposals/:id/votes
 * 
 * Cast a vote on a proposal
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const governanceService = req.scope.resolve(GOVERNANCE_MODULE)
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const {
    customer_id,
    membership_id,
    vote,
    comment,
    comment_visibility,
  } = req.body as any

  // Get proposal
  const { data: [proposal] } = await query.graph({
    entity: "garden_proposal",
    fields: ["id", "garden_id", "status", "voting_end", "votes_for", "votes_against", "votes_abstain", "total_voting_power", "unique_voters"],
    filters: { id },
  })

  if (!proposal) {
    res.status(404).json({ message: "Proposal not found" })
    return
  }

  if (proposal.status !== "active") {
    res.status(400).json({ message: "Voting is not open for this proposal" })
    return
  }

  if (new Date() > new Date(proposal.voting_end)) {
    res.status(400).json({ message: "Voting period has ended" })
    return
  }

  // Check if already voted
  const { data: existingVotes } = await query.graph({
    entity: "garden_vote",
    fields: ["id"],
    filters: { proposal_id: id, customer_id },
  })

  if (existingVotes.length > 0) {
    res.status(400).json({ message: "You have already voted on this proposal" })
    return
  }

  // Get membership for voting power
  const { data: [membership] } = await query.graph({
    entity: "garden_membership",
    fields: ["id", "voting_power", "total_labor_hours", "total_investment", "roles"],
    filters: { id: membership_id },
  })

  // Get garden for governance model
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

  const voteRecord = await governanceService.createGardenVotes({
    proposal_id: id,
    garden_id: proposal.garden_id,
    customer_id,
    membership_id,
    vote,
    voting_power,
    power_basis: {
      base: 1,
      labor_hours: membership?.total_labor_hours || 0,
      investment: membership?.total_investment || 0,
    },
    comment,
    comment_visibility: comment_visibility || "public",
    is_delegated: false,
    is_final: true,
    voted_at: new Date(),
  })

  // Update proposal vote counts
  const voteUpdates: any = {
    id,
    total_voting_power: proposal.total_voting_power + voting_power,
    unique_voters: proposal.unique_voters + 1,
  }

  if (vote === "for") {
    voteUpdates.votes_for = proposal.votes_for + voting_power
  } else if (vote === "against") {
    voteUpdates.votes_against = proposal.votes_against + voting_power
  } else {
    voteUpdates.votes_abstain = proposal.votes_abstain + voting_power
  }

  await governanceService.updateGardenProposals(voteUpdates)

  res.status(201).json({ vote: voteRecord })
}
