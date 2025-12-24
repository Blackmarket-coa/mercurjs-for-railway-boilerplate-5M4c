import OdooModuleService from "./service"
import { Module } from "@medusajs/framework/utils"

export const ODOO_MODULE = "odoo"

export default Module(ODOO_MODULE, {
  service: OdooModuleService,
})
