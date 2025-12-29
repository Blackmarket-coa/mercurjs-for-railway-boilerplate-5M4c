import { Module } from "@medusajs/framework/utils"
import GardenModuleService from "./service"

/**
 * Garden Module
 * 
 * Manages community gardens including:
 * - Garden creation and configuration
 * - Plot management and assignments
 * - Soil zone tracking
 * - Membership management
 * - Ledger integration for finances
 */
export const GARDEN_MODULE = "gardenModuleService"

export default Module(GARDEN_MODULE, {
  service: GardenModuleService,
})

export * from "./models"
export * from "./services/garden-ledger"
