import { Module } from "@medusajs/framework/utils"
import OrderCycleModuleService from "./service"

export const ORDER_CYCLE_MODULE = "orderCycleModuleService"

export default Module(ORDER_CYCLE_MODULE, {
  service: OrderCycleModuleService,
})

// Re-export models for use in links
export * from "./models"
