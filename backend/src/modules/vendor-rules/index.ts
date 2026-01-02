import { Module } from "@medusajs/framework/utils"
import VendorRulesService from "./service"

export const VENDOR_RULES_MODULE = "vendorRules"

export default Module(VENDOR_RULES_MODULE, {
  service: VendorRulesService,
})
