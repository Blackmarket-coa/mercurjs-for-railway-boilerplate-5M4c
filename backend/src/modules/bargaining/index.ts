import { Module } from "@medusajs/framework/utils"
import BargainingModuleService from "./service"

export const BARGAINING_MODULE = "bargainingModuleService"

export default Module(BARGAINING_MODULE, {
  service: BargainingModuleService,
})

export * from "./models"
