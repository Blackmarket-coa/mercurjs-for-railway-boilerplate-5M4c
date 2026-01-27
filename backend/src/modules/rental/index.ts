import { Module } from "@medusajs/framework/utils"
import RentalModuleService from "./service"

export const RENTAL_MODULE = "rental"

export default Module(RENTAL_MODULE, {
  service: RentalModuleService,
})

// Re-export types for external use
export * from "./models"
