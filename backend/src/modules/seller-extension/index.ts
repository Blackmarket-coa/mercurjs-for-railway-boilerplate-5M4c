import { Module } from "@medusajs/framework/utils"
import SellerExtensionService from "./service"

export const SELLER_EXTENSION_MODULE = "sellerExtension"

export default Module(SELLER_EXTENSION_MODULE, {
  service: SellerExtensionService,
})

// Re-export types for external use
export * from "./models"
