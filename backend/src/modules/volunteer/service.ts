import { MedusaService } from "@medusajs/framework/utils"
import { VolunteerLog, TimeCredit, WorkParty, WorkPartySignup } from "./models"

/**
 * Volunteer Module Service
 * 
 * Manages volunteer hours, time credits, and work parties.
 */
export class VolunteerModuleService extends MedusaService({
  VolunteerLog,
  TimeCredit,
  WorkParty,
  WorkPartySignup,
}) {}

export default VolunteerModuleService
