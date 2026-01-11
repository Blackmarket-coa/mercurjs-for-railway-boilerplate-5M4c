import { Module } from "@medusajs/framework/utils"
import KitchenModuleService from "./service"

/**
 * Kitchen Module
 *
 * Manages commercial community kitchens including:
 * - Kitchen creation and configuration
 * - Space/station management and rentals
 * - Equipment tracking and maintenance
 * - Membership management
 * - Ledger integration for finances
 */
export const KITCHEN_MODULE = "kitchenModuleService"

export default Module(KITCHEN_MODULE, {
  service: KitchenModuleService,
})

export * from "./models"
export * from "./services/kitchen-ledger"
