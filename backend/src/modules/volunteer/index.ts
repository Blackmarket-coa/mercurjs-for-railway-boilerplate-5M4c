import { Module } from "@medusajs/framework/utils"
import VolunteerModuleService from "./service"

/**
 * Volunteer Module
 * 
 * Manages time banking and volunteering including:
 * - Volunteer hour logging and verification
 * - Time credit earning and redemption
 * - Work party scheduling and signup
 * - Credit multipliers for special events
 */
export const VOLUNTEER_MODULE = "volunteerModuleService"

export default Module(VOLUNTEER_MODULE, {
  service: VolunteerModuleService,
})

export * from "./models"
