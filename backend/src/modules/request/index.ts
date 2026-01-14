import { Module } from "@medusajs/framework/utils"
import RequestModuleService from "./service"

export const REQUEST_MODULE = "requestModuleService"

export default Module(REQUEST_MODULE, {
  service: RequestModuleService,
})
