import { MedusaService } from "@medusajs/framework/utils"
import { Kitchen, KitchenSpace, KitchenEquipment, KitchenMembership } from "./models"

/**
 * Kitchen Module Service
 *
 * Core service for managing commercial community kitchens, spaces,
 * equipment, and memberships.
 */
export class KitchenModuleService extends MedusaService({
  Kitchen,
  KitchenSpace,
  KitchenEquipment,
  KitchenMembership,
}) {}

export default KitchenModuleService
