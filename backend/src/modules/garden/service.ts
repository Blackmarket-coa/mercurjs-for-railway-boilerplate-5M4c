import { MedusaService } from "@medusajs/framework/utils"
import { Garden, GardenPlot, SoilZone, GardenMembership } from "./models"

/**
 * Garden Module Service
 * 
 * Core service for managing community gardens, plots, soil zones,
 * and memberships.
 */
export class GardenModuleService extends MedusaService({
  Garden,
  GardenPlot,
  SoilZone,
  GardenMembership,
}) {}

export default GardenModuleService
