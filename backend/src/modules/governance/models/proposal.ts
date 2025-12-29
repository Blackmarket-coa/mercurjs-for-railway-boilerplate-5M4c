import { model } from "@medusajs/framework/utils"

/**
 * Garden Proposal Model
 * 
 * Represents a governance proposal for the garden community
 * to vote on. Supports budget requests, policy changes, etc.
 */
export const GardenProposal = model.define("garden_proposal", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  // Proposal details
  title: model.text(),
  description: model.text(),
  summary: model.text().nullable(), // Short summary for listings
  
  // Type
  proposal_type: model.enum([
    "budget",           // Spending from funds
    "policy",           // Rule changes
    "membership",       // Member actions (suspension, etc.)
    "infrastructure",   // Physical changes
    "governance",       // Governance rule changes
    "allocation",       // Harvest allocation rule changes
    "season_plan",      // Approve season growing plan
    "partnership",      // External partnerships
    "other"
  ]),
  
  // Proposer
  proposed_by_id: model.text(),
  co_sponsors: model.json().nullable(), // customer_ids
  
  // Voting period
  voting_start: model.dateTime(),
  voting_end: model.dateTime(),
  
  // Thresholds
  quorum_required: model.bigNumber(), // Percentage of eligible voters
  approval_threshold: model.bigNumber(), // Percentage for approval
  
  // Status
  status: model.enum([
    "draft",
    "submitted",    // Awaiting review
    "active",       // Open for voting
    "passed",
    "rejected",
    "tie",          // Needs resolution
    "implemented",
    "withdrawn",
    "expired"       // Voting ended without quorum
  ]).default("draft"),
  
  // Vote counts
  votes_for: model.bigNumber().default(0),
  votes_against: model.bigNumber().default(0),
  votes_abstain: model.bigNumber().default(0),
  total_voting_power: model.bigNumber().default(0),
  unique_voters: model.number().default(0),
  
  // Eligibility
  eligible_voters: model.number().nullable(),
  eligible_voting_power: model.bigNumber().nullable(),
  
  // Result
  result_calculated_at: model.dateTime().nullable(),
  quorum_met: model.boolean().nullable(),
  approval_percentage: model.bigNumber().nullable(),
  
  // Implementation
  implementation_notes: model.text().nullable(),
  implemented_at: model.dateTime().nullable(),
  implemented_by_id: model.text().nullable(),
  
  // Budget request (if budget proposal)
  budget_request: model.json().nullable(), // { fund, amount, purpose, timeline }
  
  // Policy changes (if policy proposal)
  policy_changes: model.json().nullable(), // { current, proposed }
  
  // Attachments
  attachment_urls: model.json().nullable(),
  
  // Discussion
  discussion_enabled: model.boolean().default(true),
  
  // Ledger entry (if approved budget)
  ledger_entry_id: model.text().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
