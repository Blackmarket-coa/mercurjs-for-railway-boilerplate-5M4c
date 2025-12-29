import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

const GOVERNANCE_MODULE = "governanceModuleService"

interface GovernanceServiceType {
  createGardenProposals: (data: Record<string, unknown>) => Promise<{ id: string }>
}

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

  const filters: Record<string, unknown> = {}
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
  const governanceService = req.scope.resolve(GOVERNANCE_MODULE) as GovernanceServiceType

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
  } = req.body as Record<string, unknown>

  const proposal = await governanceService.createGardenProposals({
    garden_id,
    title,
    description,
    summary,
    proposal_type: (proposal_type as string) || "other",
    proposed_by_id,
    voting_start: voting_start ? new Date(voting_start as string) : new Date(),
    voting_end: new Date(voting_end as string),
    quorum_required: (quorum_required as number) || 50,
    approval_threshold: (approval_threshold as number) || 51,
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
