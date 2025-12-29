import { model } from "@medusajs/framework/utils"

/**
 * Vendor-to-Vendor Payment
 * Internal transfers between vendors (suppliers, partners)
 */
export const VendorPayment = model.define("hawala_vendor_payment", {
  id: model.id().primaryKey(),
  
  // Participants
  payer_vendor_id: model.text(),
  payer_ledger_account_id: model.text(),
  payee_vendor_id: model.text(),
  payee_ledger_account_id: model.text(),
  
  // Payment details
  amount: model.bigNumber(),
  currency_code: model.text().default("USD"),
  
  // Reference
  payment_type: model.enum([
    "SUPPLIER_PAYMENT",   // Paying a supplier
    "REVENUE_SHARE",      // Revenue sharing
    "REFUND",             // Internal refund
    "CREDIT_REPAYMENT",   // Trade credit repayment
    "OTHER",
  ]),
  
  // External reference
  invoice_number: model.text().nullable(),
  purchase_order_number: model.text().nullable(),
  reference_note: model.text().nullable(),
  
  // Ledger tracking
  ledger_entry_id: model.text().nullable(),
  
  // Status
  status: model.enum([
    "PENDING",
    "COMPLETED",
    "FAILED",
    "CANCELED",
  ]).default("COMPLETED"),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Vendor Credit Line
 * Trade credit between vendors
 */
export const VendorCreditLine = model.define("hawala_vendor_credit_line", {
  id: model.id().primaryKey(),
  
  // Creditor (vendor extending credit)
  creditor_vendor_id: model.text(),
  creditor_ledger_account_id: model.text(),
  
  // Debtor (vendor receiving credit)
  debtor_vendor_id: model.text(),
  debtor_ledger_account_id: model.text(),
  
  // Credit terms
  credit_limit: model.bigNumber(),
  current_balance: model.bigNumber().default(0), // Amount owed
  available_credit: model.bigNumber(), // credit_limit - current_balance
  
  // Terms
  terms_days: model.number().default(30), // Net 30
  interest_rate: model.bigNumber().default(0), // 0% for first 30 days
  late_fee_rate: model.bigNumber().default(0),
  grace_period_days: model.number().default(0),
  
  // Status
  status: model.enum([
    "PENDING_APPROVAL",
    "ACTIVE",
    "FROZEN",
    "CLOSED",
    "DEFAULTED",
  ]).default("PENDING_APPROVAL"),
  
  // Activity tracking
  last_activity_at: model.dateTime().nullable(),
  total_credit_used: model.bigNumber().default(0),
  total_repaid: model.bigNumber().default(0),
  
  // Approval
  approved_at: model.dateTime().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Credit Line Transaction
 * Individual credit draws and repayments
 */
export const CreditLineTransaction = model.define("hawala_credit_line_transaction", {
  id: model.id().primaryKey(),
  
  // References
  credit_line_id: model.text(),
  ledger_entry_id: model.text().nullable(),
  vendor_payment_id: model.text().nullable(),
  
  // Transaction type
  transaction_type: model.enum([
    "DRAW",         // Using credit
    "REPAYMENT",    // Paying back
    "INTEREST",     // Interest charge
    "LATE_FEE",     // Late fee
    "ADJUSTMENT",   // Manual adjustment
  ]),
  
  // Amount
  amount: model.bigNumber(),
  balance_after: model.bigNumber(), // Credit line balance after
  
  // Due date for draws
  due_date: model.dateTime().nullable(),
  
  // Status
  status: model.enum([
    "PENDING",
    "COMPLETED",
    "OVERDUE",
    "DEFAULTED",
  ]).default("COMPLETED"),
  
  // Notes
  notes: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
