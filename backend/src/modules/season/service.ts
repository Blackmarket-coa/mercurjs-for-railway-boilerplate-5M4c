import { MedusaService } from "@medusajs/framework/utils"
import { GardenSeason, GardenPlanting, GrowingPlan } from "./models"

/**
 * Season Module Service
 * 
 * Manages growing seasons, plantings, and growing plans.
 */
export class SeasonModuleService extends MedusaService({
  GardenSeason,
  GardenPlanting,
  GrowingPlan,
}) {}

export default SeasonModuleService
