import { Module } from "@medusajs/framework/utils"
import WooCommerceImportModuleService from "./service"

export const WOOCOMMERCE_IMPORT_MODULE = "woocommerceImport"

export default Module(WOOCOMMERCE_IMPORT_MODULE, {
  service: WooCommerceImportModuleService,
})

export * from "./models"
