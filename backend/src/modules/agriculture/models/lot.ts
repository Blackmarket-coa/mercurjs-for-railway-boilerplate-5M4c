import { model } from "@medusajs/framework/utils"

/**
 * Lot/Batch Grade
 */
export enum LotGrade {
  PREMIUM = "PREMIUM",     // Top quality, retail
  GRADE_A = "GRADE_A",     // Standard retail quality
  GRADE_B = "GRADE_B",     // Minor cosmetic issues
  PROCESSING = "PROCESSING", // Suitable for processing/cooking
  IMPERFECT = "IMPERFECT", // "Ugly" produce, still edible
  SECONDS = "SECONDS",     // Second-quality items
}

/**
 * Lot Allocation Type
 */
export enum LotAllocation {
  RETAIL = "RETAIL",       // Direct to consumer
  RESTAURANT = "RESTAURANT", // B2B restaurant sales
  WHOLESALE = "WHOLESALE", // Bulk/wholesale
  CSA = "CSA",             // Community Supported Agriculture
  COOPERATIVE = "COOPERATIVE", // Food hub/coop distribution
  DONATION = "DONATION",   // Food bank/charitable
  PROCESSING = "PROCESSING", // Value-added processing
}

/**
 * Lot (Batch)
 * 
 * A harvest may yield multiple lots with different qualities or destinations.
 * Lots are the BRIDGE between harvests and sellable availability.
 * 
 * Inventory is tracked at the lot level, not the SKU level.
 */
const Lot = model.define("lot", {
  id: model.id().primaryKey(),
  
  // Link to harvest
  harvest_id: model.text(),
  
  // Lot identification
  lot_number: model.text().nullable(), // Optional lot tracking number
  batch_date: model.dateTime().nullable(), // When this batch was processed
  
  // Quality grading
  grade: model.enum(Object.values(LotGrade)).default(LotGrade.GRADE_A),
  size_class: model.text().nullable(), // e.g., "Large", "Medium", "Small"
  
  // Quantity tracking (THIS IS THE INVENTORY SOURCE OF TRUTH)
  quantity_total: model.float(), // Total quantity harvested/produced
  quantity_available: model.float(), // Currently available for sale
  quantity_reserved: model.float().default(0), // Reserved in carts/pending orders
  quantity_sold: model.float().default(0), // Already sold
  unit: model.text(), // lb, kg, bunch, case, each, dozen, etc.
  
  // Pricing guidance (optional, can be overridden at availability level)
  suggested_price_per_unit: model.float().nullable(),
  cost_per_unit: model.float().nullable(), // Producer's cost basis
  
  // Allocation type
  allocation_type: model.enum(Object.values(LotAllocation)).default(LotAllocation.RETAIL),
  
  // Surplus handling
  surplus_flag: model.boolean().default(false),
  surplus_declared_at: model.dateTime().nullable(),
  surplus_reason: model.text().nullable(), // e.g., "Excess yield", "Order cancellation"
  
  // Expiration/shelf life
  best_by_date: model.dateTime().nullable(),
  use_by_date: model.dateTime().nullable(),
  
  // Storage/handling
  storage_location: model.text().nullable(),
  storage_requirements: model.text().nullable(), // e.g., "Refrigerate", "Cool and dry"
  
  // Traceability
  external_lot_id: model.text().nullable(), // For integration with external systems
  
  // Status
  is_active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["harvest_id"],
      name: "IDX_lot_harvest",
    },
    {
      on: ["grade"],
      name: "IDX_lot_grade",
    },
    {
      on: ["allocation_type"],
      name: "IDX_lot_allocation",
    },
    {
      on: ["surplus_flag"],
      name: "IDX_lot_surplus",
    },
    {
      on: ["is_active"],
      name: "IDX_lot_active",
    },
    {
      on: ["best_by_date"],
      name: "IDX_lot_best_by",
    },
  ])

export default Lot
