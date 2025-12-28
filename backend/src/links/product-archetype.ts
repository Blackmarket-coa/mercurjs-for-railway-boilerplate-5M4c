import { defineLink } from "@medusajs/framework/utils"
import ProductArchetypeModule from "../modules/product-archetype"
import ProductModule from "@medusajs/medusa/product"

/**
 * Link Product to Product Archetype Assignment
 * 
 * Enables products to have archetype-based behavior.
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: false,
  },
  {
    linkable: ProductArchetypeModule.linkable.productArchetypeAssignment,
    isList: false,
  }
)
