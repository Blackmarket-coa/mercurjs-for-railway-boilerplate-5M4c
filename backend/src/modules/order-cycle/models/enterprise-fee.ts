import { model } from "@medusajs/framework/utils"

/**
 * Enterprise Fee - Flexible fee system for order cycles
 * 
 * Based on OFN's Enterprise Fee concept:
 * - Coordinator fees: applied to all products in cycle
 * - Producer fees: per-supplier markups
 * - Distributor fees: per-hub markups
 * 
 * Fee calculators determine how fees are applied:
 * - flat_rate: fixed amount per order/item
 * - percentage: percentage of product price
 * - weight: per kg/lb
 * - per_item: fixed amount per item
 */
const EnterpriseFee = model.define("enterprise_fee", {
  id: model.id().primaryKey(),
  
  // Fee identification
  name: model.text().searchable(),
  description: model.text().nullable(),
  
  // Owner - the seller who created this fee template
  seller_id: model.text(),
  
  // Fee type categorization
  fee_type: model.enum([
    "admin",        // Administrative costs
    "packing",      // Packing/handling costs
    "transport",    // Delivery/shipping costs
    "fundraising",  // Donations/fundraising
    "sales",        // Sales commission
    "coordinator",  // Order cycle coordination fee
  ]),
  
  // Calculator type - how the fee is calculated
  calculator_type: model.enum([
    "flat_rate",      // Fixed amount per order
    "flat_per_item",  // Fixed amount per line item
    "percentage",     // Percentage of item price
    "weight",         // Per unit weight (kg)
  ]),
  
  // Calculator settings
  amount: model.bigNumber(),           // The fee amount (cents for flat, basis points for %)
  currency_code: model.text().default("usd"),
  
  // Tax handling
  tax_category_id: model.text().nullable(),
  inherits_tax_category: model.boolean().default(true),
  
  // Status
  is_active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})
.indexes([
  {
    name: "IDX_EF_SELLER_ID",
    on: ["seller_id"],
  },
  {
    name: "IDX_EF_FEE_TYPE",
    on: ["fee_type"],
  },
  {
    name: "IDX_EF_ACTIVE",
    on: ["is_active"],
  },
])

export default EnterpriseFee
