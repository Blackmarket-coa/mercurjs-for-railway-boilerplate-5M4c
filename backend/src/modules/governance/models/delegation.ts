import { model } from "@medusajs/framework/utils"

/**
 * Vote Delegation Model
 * 
 * Allows members to delegate their voting power to another member.
 */
export const VoteDelegation = model.define("garden_vote_delegation", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  // Delegator (the one giving their vote)
  delegator_id: model.text(),
  delegator_membership_id: model.text(),
  
  // Delegate (the one receiving voting power)
  delegate_id: model.text(),
  delegate_membership_id: model.text(),
  
  // Scope
  scope: model.enum([
    "all",              // All proposals
    "category",         // Specific proposal types
    "single"            // Single proposal only
  ]).default("all"),
  
  // If category scope
  proposal_types: model.json().nullable(), // string[]
  
  // If single scope
  proposal_id: model.text().nullable(),
  
  // Active period
  effective_from: model.dateTime(),
  effective_until: model.dateTime().nullable(),
  
  // Status
  status: model.enum(["active", "revoked", "expired"]).default("active"),
  revoked_at: model.dateTime().nullable(),
  
  // Notes
  reason: model.text().nullable(),
  
  metadata: model.json().nullable(),
})
