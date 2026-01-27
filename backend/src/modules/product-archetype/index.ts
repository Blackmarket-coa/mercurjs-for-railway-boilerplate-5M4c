import { Module } from "@medusajs/framework/utils"
import ProductArchetypeService from "./service"

export const PRODUCT_ARCHETYPE_MODULE = "productArchetype"

export default Module(PRODUCT_ARCHETYPE_MODULE, {
  service: ProductArchetypeService,
})

// Re-export types for external use
export * from "./models"
