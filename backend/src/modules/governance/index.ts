import { Module } from "@medusajs/framework/utils"
import GovernanceModuleService from "./service"

/**
 * Governance Module
 * 
 * Manages democratic garden governance including:
 * - Proposal creation and voting
 * - Role management and assignments
 * - Voting power calculation
 * - Vote delegation
 * - Discussion and comments
 */
export const GOVERNANCE_MODULE = "governanceModuleService"

export default Module(GOVERNANCE_MODULE, {
  service: GovernanceModuleService,
})

export * from "./models"
