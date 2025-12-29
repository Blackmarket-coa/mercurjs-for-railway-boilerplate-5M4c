import { MedusaService } from "@medusajs/framework/utils"
import { Garden, Plot, SoilZone, GardenMembership } from "./models"

/**
 * Garden Module Service
 * 
 * Core service for managing community gardens, plots, soil zones,
 * and memberships.
 */
export class GardenModuleService extends MedusaService({
  Garden,
  Plot,
  SoilZone,
  GardenMembership,
}) {}

export default GardenModuleService
