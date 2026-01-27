import { Module } from "@medusajs/framework/utils"
import DigitalProductModuleService from "./service"

export const DIGITAL_PRODUCT_MODULE = "digitalProduct"

export default Module(DIGITAL_PRODUCT_MODULE, {
  service: DigitalProductModuleService,
})

// Re-export types for external use
export * from "./models"