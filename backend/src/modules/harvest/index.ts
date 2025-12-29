import { Module } from "@medusajs/framework/utils"
import HarvestModuleService from "./service"

/**
 * Harvest Module
 * 
 * Manages harvest collection and distribution including:
 * - Harvest recording and valuation
 * - Pool-based allocation
 * - Member claim management
 * - Allocation rule configuration
 */
export const HARVEST_MODULE = "harvestModuleService"

export default Module(HARVEST_MODULE, {
  service: HarvestModuleService,
})

export * from "./models"
export * from "./services/allocation-engine"
