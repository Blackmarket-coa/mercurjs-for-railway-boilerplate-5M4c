import { Module } from "@medusajs/framework/utils"
import CooperativeService from "./service"

export const COOPERATIVE_MODULE = "cooperative"

export default Module(COOPERATIVE_MODULE, {
  service: CooperativeService,
})
