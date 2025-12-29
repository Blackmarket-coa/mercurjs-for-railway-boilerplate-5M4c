import { MedusaService } from "@medusajs/framework/utils"
import { GrowingSeason, Planting, GrowingPlan } from "./models"

/**
 * Season Module Service
 * 
 * Manages growing seasons, plantings, and growing plans.
 */
export class SeasonModuleService extends MedusaService({
  GrowingSeason,
  Planting,
  GrowingPlan,
}) {}

export default SeasonModuleService
