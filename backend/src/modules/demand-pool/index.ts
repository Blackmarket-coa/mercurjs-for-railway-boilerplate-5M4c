import { Module } from "@medusajs/framework/utils"
import DemandPoolModuleService from "./service"

export const DEMAND_POOL_MODULE = "demandPoolModuleService"

export default Module(DEMAND_POOL_MODULE, {
  service: DemandPoolModuleService,
})

export * from "./models"
