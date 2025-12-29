import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { GOVERNANCE_MODULE } from "../../../modules/governance"
import { GardenLedgerService } from "../../../modules/garden/services/garden-ledger"

/**
 * GET /store/proposals
 * 
 * List governance proposals
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { garden_id, status, proposal_type } = req.query

  const filters: any = {}
  if (garden_id) filters.garden_id = garden_id
  if (status) filters.status = status
  if (proposal_type) filters.proposal_type = proposal_type

  const { data: proposals } = await query.graph({
    entity: "garden_proposal",
    fields: [
      "id",
      "garden_id",
      "title",
      "summary",
      "proposal_type",
      "proposed_by_id",
      "voting_start",
      "voting_end",
      "status",
      "votes_for",
      "votes_against",
      "votes_abstain",
      "unique_voters",
      "quorum_required",
      "approval_threshold",
    ],
    filters,
  })

  res.json({ proposals })
}

/**
 * POST /store/proposals
 * 
 * Create a new proposal
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const governanceService = req.scope.resolve(GOVERNANCE_MODULE)

  const {
    garden_id,
    title,
    description,
    summary,
    proposal_type,
    proposed_by_id,
    voting_start,
    voting_end,
    quorum_required,
    approval_threshold,
    budget_request,
    policy_changes,
    attachment_urls,
  } = req.body as any

  const proposal = await governanceService.createGardenProposals({
    garden_id,
    title,
    description,
    summary,
    proposal_type: proposal_type || "other",
    proposed_by_id,
    voting_start: voting_start ? new Date(voting_start) : new Date(),
    voting_end: new Date(voting_end),
    quorum_required: quorum_required || 50,
    approval_threshold: approval_threshold || 51,
    status: voting_start ? "active" : "draft",
    votes_for: 0,
    votes_against: 0,
    votes_abstain: 0,
    total_voting_power: 0,
    unique_voters: 0,
    budget_request,
    policy_changes,
    attachment_urls,
    discussion_enabled: true,
  })

  res.status(201).json({ proposal })
}
