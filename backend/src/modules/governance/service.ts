import { MedusaService } from "@medusajs/framework/utils"
import { GardenProposal, GardenVote, GardenRole, RoleAssignment, ProposalComment, VoteDelegation } from "./models"

/**
 * Governance Module Service
 * 
 * Manages democratic governance for community gardens.
 */
export class GovernanceModuleService extends MedusaService({
  GardenProposal,
  GardenVote,
  GardenRole,
  RoleAssignment,
  ProposalComment,
  VoteDelegation,
}) {}

export default GovernanceModuleService
