import { defineLink } from "@medusajs/framework/utils"
import AgricultureModule from "../modules/agriculture"
import ProductModule from "@medusajs/medusa/product"

/**
 * Link Availability Window to Medusa Product
 * 
 * Connects agricultural availability windows to storefront products.
 * This enables products to be backed by harvest-based inventory.
 */
export default defineLink(
  {
    linkable: ProductModule.linkable.product,
    isList: false,
  },
  {
    linkable: AgricultureModule.linkable.availabilityWindow,
    isList: true, // A product can have multiple availability windows
  }
)
