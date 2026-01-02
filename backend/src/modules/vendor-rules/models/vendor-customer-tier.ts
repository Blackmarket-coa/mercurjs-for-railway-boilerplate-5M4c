import { model } from "@medusajs/framework/utils"

/**
 * Customer Tier Type
 */
export enum CustomerTierType {
  REGULAR = "REGULAR",
  PREFERRED = "PREFERRED",
  WHOLESALE = "WHOLESALE",
  RESTAURANT = "RESTAURANT",
  COOP_MEMBER = "COOP_MEMBER",
}

/**
 * Vendor Customer Tier
 * 
 * Vendor-defined customer tiers for differentiated pricing/service.
 * Enables wholesale, restaurant, and preferred customer programs.
 */
const VendorCustomerTier = model.define("vendor_customer_tier", {
  id: model.id().primaryKey(),
  
  // Link to seller
  seller_id: model.text(),
  
  // Tier type
  tier_type: model.enum(Object.values(CustomerTierType)),
  
  // Tier name (vendor can customize)
  name: model.text(),
  
  // Description
  description: model.text().nullable(),
  
  // === Benefits ===
  
  // Discount percentage
  discount_percent: model.number().default(0),
  
  // Waive minimum order
  waive_order_minimum: model.boolean().default(false),
  
  // Priority fulfillment
  priority_fulfillment: model.boolean().default(false),
  
  // Extended payment terms (days)
  payment_terms_days: model.number().default(0),
  
  // Free delivery threshold (cents, 0 = no free delivery)
  free_delivery_threshold: model.number().default(0),
  
  // === Requirements ===
  
  // Minimum order value to maintain tier
  min_monthly_order: model.number().default(0),
  
  // Application required
  requires_application: model.boolean().default(false),
  
  // === Members ===
  
  // Customer IDs in this tier
  customer_ids: model.json().nullable(), // string[]
  
  // Active
  active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["seller_id"],
      name: "IDX_vct_seller_id",
    },
    {
      on: ["tier_type"],
      name: "IDX_vct_tier_type",
    },
  ])

export default VendorCustomerTier
