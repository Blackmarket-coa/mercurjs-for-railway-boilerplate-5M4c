import { defineLink } from "@medusajs/framework/utils"
import OrderCycleModule from "../modules/order-cycle"
import ProductModule from "@medusajs/medusa/product"

/**
 * Link Order Cycle Product to Product Variant
 * 
 * Associates order cycle products with their source product variants.
 * This enables:
 * - Retrieving full product details when listing cycle products
 * - Price override resolution
 * - Inventory coordination
 */
export default defineLink(
  {
    linkable: OrderCycleModule.linkable.orderCycleProduct,
    field: "variant_id",
  },
  ProductModule.linkable.productVariant
)
