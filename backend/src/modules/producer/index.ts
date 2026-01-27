import { Module } from "@medusajs/framework/utils"
import ProducerService from "./service"

export const PRODUCER_MODULE = "producer"

export default Module(PRODUCER_MODULE, {
  service: ProducerService,
})

// Re-export types for external use
export * from "./models"
