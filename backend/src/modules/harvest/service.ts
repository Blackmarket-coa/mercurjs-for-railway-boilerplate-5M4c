import { MedusaService } from "@medusajs/framework/utils"
import { GardenHarvest, HarvestAllocation, HarvestClaim, AllocationRule } from "./models"

/**
 * Harvest Module Service
 * 
 * Manages harvests, allocations, claims, and distribution rules.
 */
export class HarvestModuleService extends MedusaService({
  GardenHarvest,
  HarvestAllocation,
  HarvestClaim,
  AllocationRule,
}) {}

export default HarvestModuleService
