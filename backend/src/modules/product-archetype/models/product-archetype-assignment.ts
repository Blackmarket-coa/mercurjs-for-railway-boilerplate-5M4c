import { model } from "@medusajs/framework/utils"

/**
 * Product Archetype Assignment
 * 
 * Links a product to its archetype.
 * Allows multiple products to share the same archetype behavior.
 */
const ProductArchetypeAssignment = model.define("product_archetype_assignment", {
  id: model.id().primaryKey(),
  
  // Product ID (linked via module link to Medusa product)
  product_id: model.text().unique(),
  
  // Archetype ID
  archetype_id: model.text(),
  
  // Override flags (per-product overrides of archetype defaults)
  override_refundable: model.boolean().nullable(),
  override_return_window_days: model.number().nullable(),
  override_fulfillment_lead_time_hours: model.number().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["archetype_id"],
      name: "IDX_product_archetype_assignment_archetype",
    },
  ])

export default ProductArchetypeAssignment
