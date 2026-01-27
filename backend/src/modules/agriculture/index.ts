import { Module } from "@medusajs/framework/utils"
import AgricultureService from "./service"

export const AGRICULTURE_MODULE = "agriculture"

export default Module(AGRICULTURE_MODULE, {
  service: AgricultureService,
})

// Re-export types for external use
export * from "./models"
