import { model } from "@medusajs/framework/utils"

/**
 * Vendor Advance (Earnings Advance / Invoice Factoring)
 * Provides cash advances to vendors based on their sales history
 */
export const VendorAdvance = model.define("hawala_vendor_advance", {
  id: model.id().primaryKey(),
  
  // Vendor reference
  vendor_id: model.text(),
  ledger_account_id: model.text(),
  
  // Advance details
  principal_amount: model.bigNumber(), // Original advance amount
  outstanding_balance: model.bigNumber(), // Current balance owed
  total_repaid: model.bigNumber().default(0), // Total repaid so far
  
  // Fee structure
  fee_type: model.enum([
    "FLAT",           // One-time flat fee
    "WEEKLY_PERCENT", // Weekly percentage (e.g., 1% per week)
    "FACTOR_RATE",    // Factor rate (e.g., 1.15 = 15% total)
  ]).default("FACTOR_RATE"),
  fee_rate: model.bigNumber(), // Rate value based on fee_type
  fee_cap: model.bigNumber().nullable(), // Maximum fee (e.g., 1.25 = 25% max)
  total_fee_charged: model.bigNumber().default(0),
  
  // Repayment
  repayment_method: model.enum([
    "AUTO_DEDUCT",      // Auto-deduct from sales
    "MANUAL",           // Manual payments
    "SCHEDULED",        // Scheduled payments
  ]).default("AUTO_DEDUCT"),
  repayment_rate: model.bigNumber().default(0.2), // 20% of daily sales
  
  // Term
  term_days: model.number().default(30),
  start_date: model.dateTime(),
  expected_end_date: model.dateTime(),
  actual_end_date: model.dateTime().nullable(),
  
  // Eligibility factors (recorded at time of advance)
  eligibility_snapshot: model.json().nullable(), // 30-day avg, history, etc.
  
  // Status
  status: model.enum([
    "PENDING_APPROVAL",
    "APPROVED",
    "ACTIVE",
    "REPAID",
    "DEFAULTED",
    "CANCELED",
  ]).default("PENDING_APPROVAL"),
  
  // Approval
  approved_by: model.text().nullable(),
  approved_at: model.dateTime().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Advance Repayment
 * Tracks individual repayments against an advance
 */
export const AdvanceRepayment = model.define("hawala_advance_repayment", {
  id: model.id().primaryKey(),
  
  // References
  advance_id: model.text(),
  ledger_entry_id: model.text().nullable(), // Linked ledger entry
  order_id: model.text().nullable(), // If auto-deducted from sale
  
  // Amounts
  principal_amount: model.bigNumber(), // Goes toward principal
  fee_amount: model.bigNumber().default(0), // Fee portion
  total_amount: model.bigNumber(), // Total payment
  
  // Balance after
  outstanding_balance_after: model.bigNumber(),
  
  // Method
  repayment_type: model.enum([
    "AUTO_DEDUCT",    // Auto-deducted from sale
    "MANUAL",         // Manual payment
    "ADJUSTMENT",     // Manual adjustment
  ]),
  
  // Status
  status: model.enum([
    "PENDING",
    "COMPLETED",
    "FAILED",
    "REVERSED",
  ]).default("COMPLETED"),
  
  // Metadata
  metadata: model.json().nullable(),
})
