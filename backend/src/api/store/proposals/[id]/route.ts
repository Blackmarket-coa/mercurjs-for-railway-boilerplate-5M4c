import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GOVERNANCE_MODULE } from "../../../../modules/governance"

/**
 * GET /store/proposals/:id
 * 
 * Get a proposal by ID
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: [proposal] } = await query.graph({
    entity: "garden_proposal",
    fields: [
      "id",
      "garden_id",
      "title",
      "description",
      "summary",
      "proposal_type",
      "proposed_by_id",
      "co_sponsors",
      "voting_start",
      "voting_end",
      "quorum_required",
      "approval_threshold",
      "status",
      "votes_for",
      "votes_against",
      "votes_abstain",
      "total_voting_power",
      "unique_voters",
      "eligible_voters",
      "eligible_voting_power",
      "result_calculated_at",
      "quorum_met",
      "approval_percentage",
      "implementation_notes",
      "implemented_at",
      "budget_request",
      "policy_changes",
      "attachment_urls",
      "discussion_enabled",
    ],
    filters: { id },
  })

  if (!proposal) {
    res.status(404).json({ message: "Proposal not found" })
    return
  }

  res.json({ proposal })
}

/**
 * PUT /store/proposals/:id
 * 
 * Update a proposal
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params
  const governanceService = req.scope.resolve(GOVERNANCE_MODULE)

  const proposal = await governanceService.updateGardenProposals({
    id,
    ...req.body,
  })

  res.json({ proposal })
}
