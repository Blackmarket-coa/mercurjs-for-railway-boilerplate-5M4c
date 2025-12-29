import {
  createWorkflow,
  WorkflowResponse,
  createStep,
  StepResponse,
} from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GOVERNANCE_MODULE } from "../../modules/governance"

/**
 * Finalize Proposal Workflow
 * 
 * Calculates final results and updates proposal status.
 */

type FinalizeProposalInput = {
  proposal_id: string
}

const finalizeProposalStep = createStep(
  "finalize-proposal-step",
  async (input: FinalizeProposalInput, { container }) => {
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
        "unique_voters",
        "quorum_required",
        "approval_threshold",
        "eligible_voters",
        "eligible_voting_power",
      ],
      filters: { id: input.proposal_id },
    })

    if (!proposal) {
      throw new Error("Proposal not found")
    }

    if (proposal.status !== "active") {
      throw new Error("Proposal is not active")
    }

    // Calculate results
    const totalVotes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain
    const votingPower = proposal.total_voting_power
    
    // Check quorum (based on unique voters if eligible_voters not set)
    const eligibleVoters = proposal.eligible_voters || 1
    const voterTurnout = (proposal.unique_voters / eligibleVoters) * 100
    const quorumMet = voterTurnout >= proposal.quorum_required

    // Calculate approval percentage (excluding abstains)
    const votesConsidered = proposal.votes_for + proposal.votes_against
    const approvalPercentage = votesConsidered > 0 
      ? (proposal.votes_for / votesConsidered) * 100 
      : 0

    // Determine status
    let newStatus: string
    if (!quorumMet) {
      newStatus = "expired"
    } else if (approvalPercentage >= proposal.approval_threshold) {
      newStatus = "passed"
    } else if (approvalPercentage === 50 && proposal.approval_threshold === 50) {
      newStatus = "tie"
    } else {
      newStatus = "rejected"
    }

    // Update proposal
    const previousStatus = proposal.status
    await governanceService.updateGardenProposals({
      id: input.proposal_id,
      status: newStatus,
      result_calculated_at: new Date(),
      quorum_met: quorumMet,
      approval_percentage: approvalPercentage,
    })

    return new StepResponse({
      proposal_id: input.proposal_id,
      status: newStatus,
      quorum_met: quorumMet,
      approval_percentage: approvalPercentage,
      votes_for: proposal.votes_for,
      votes_against: proposal.votes_against,
      unique_voters: proposal.unique_voters,
    }, { proposalId: input.proposal_id, previousStatus })
  },
  async (context, { container }) => {
    if (!context) return
    
    const governanceService = container.resolve(GOVERNANCE_MODULE)
    await governanceService.updateGardenProposals({
      id: context.proposalId,
      status: context.previousStatus,
      result_calculated_at: null,
      quorum_met: null,
      approval_percentage: null,
    })
  }
)

export const finalizeProposalWorkflow = createWorkflow(
  "finalize-garden-proposal-workflow",
  (input: FinalizeProposalInput) => {
    const result = finalizeProposalStep(input)
    return new WorkflowResponse(result)
  }
)
