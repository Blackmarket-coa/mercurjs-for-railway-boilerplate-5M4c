import { model } from "@medusajs/framework/utils"

/**
 * Payout Configuration
 * Vendor payout preferences and schedule settings
 */
export const PayoutConfig = model.define("hawala_payout_config", {
  id: model.id().primaryKey(),
  
  // Vendor reference
  vendor_id: model.text(),
  ledger_account_id: model.text(),
  
  // Default payout method
  default_bank_account_id: model.text().nullable(),
  default_payout_tier: model.enum([
    "INSTANT",    // 1% fee, 30 minutes (debit card push)
    "SAME_DAY",   // 0.5% fee, end of day (RTP/FedNow)
    "NEXT_DAY",   // 0.25% fee, next business day (ACH)
    "WEEKLY",     // 0% fee, every Friday (ACH batch)
  ]).default("WEEKLY"),
  
  // Auto-payout settings
  auto_payout_enabled: model.boolean().default(true),
  auto_payout_threshold: model.bigNumber().default(50), // Min $50 to trigger
  auto_payout_day: model.enum([
    "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"
  ]).default("FRIDAY"),
  
  // Instant payout eligibility
  instant_payout_eligible: model.boolean().default(false),
  instant_payout_daily_limit: model.bigNumber().default(10000),
  instant_payout_used_today: model.bigNumber().default(0),
  
  // Split payout enabled
  split_payout_enabled: model.boolean().default(false),
  
  // Status
  status: model.enum(["ACTIVE", "SUSPENDED", "INACTIVE"]).default("ACTIVE"),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Payout Split Rule
 * Configures automatic splitting of vendor earnings
 */
export const PayoutSplitRule = model.define("hawala_payout_split_rule", {
  id: model.id().primaryKey(),
  
  // Config reference
  payout_config_id: model.text(),
  vendor_id: model.text(),
  
  // Split destination
  destination_type: model.enum([
    "OPERATING",      // Operating account (default)
    "TAX_RESERVE",    // Tax withholding
    "SAVINGS",        // Savings account
    "SUPPLIER_PREPAY", // Supplier pre-payment
    "LOAN_REPAYMENT", // Loan/advance repayment
    "INVESTMENT",     // Reinvestment
    "CUSTOM",         // Custom purpose
  ]),
  
  // Destination account (can be external bank or internal ledger)
  destination_ledger_account_id: model.text().nullable(),
  destination_bank_account_id: model.text().nullable(),
  
  // Split percentage (must sum to 100% across all rules)
  percentage: model.bigNumber(), // e.g., 15 = 15%
  
  // Optional fixed amount (takes priority over percentage)
  fixed_amount: model.bigNumber().nullable(),
  
  // Priority (for fixed amounts, lower = first)
  priority: model.number().default(100),
  
  // Custom label
  label: model.text().nullable(), // e.g., "Q1 Tax Reserve"
  
  // Active status
  is_active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Payout Request
 * Individual payout requests from vendors
 */
export const PayoutRequest = model.define("hawala_payout_request", {
  id: model.id().primaryKey(),
  
  // References
  vendor_id: model.text(),
  ledger_account_id: model.text(),
  bank_account_id: model.text().nullable(),
  ledger_entry_id: model.text().nullable(),
  
  // Payout tier and method
  payout_tier: model.enum([
    "INSTANT",
    "SAME_DAY",
    "NEXT_DAY",
    "WEEKLY",
  ]),
  payout_method: model.enum([
    "DEBIT_CARD_PUSH",
    "RTP",
    "FEDNOW",
    "ACH",
    "ACH_BATCH",
  ]),
  
  // Amounts
  gross_amount: model.bigNumber(), // Amount before fees
  fee_amount: model.bigNumber(), // Platform fee
  net_amount: model.bigNumber(), // Amount sent to vendor
  
  // Fee breakdown
  fee_rate: model.bigNumber(), // Fee percentage
  fee_details: model.json().nullable(), // Breakdown
  
  // Stripe references
  stripe_payout_id: model.text().nullable(),
  stripe_transfer_id: model.text().nullable(),
  
  // Timing
  requested_at: model.dateTime(),
  processed_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  estimated_arrival: model.dateTime().nullable(),
  
  // Status
  status: model.enum([
    "PENDING",
    "PROCESSING",
    "IN_TRANSIT",
    "COMPLETED",
    "FAILED",
    "CANCELED",
  ]).default("PENDING"),
  
  // Error tracking
  failure_reason: model.text().nullable(),
  failure_code: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Chargeback Protection Pool
 * Pool for vendor chargeback insurance
 */
export const ChargebackProtection = model.define("hawala_chargeback_protection", {
  id: model.id().primaryKey(),
  
  // Vendor reference
  vendor_id: model.text(),
  
  // Pool balance (contributions from sales)
  pool_balance: model.bigNumber().default(0),
  total_contributions: model.bigNumber().default(0),
  total_claims_paid: model.bigNumber().default(0),
  
  // Configuration
  contribution_rate: model.bigNumber().default(0.002), // 0.2% of each sale
  max_coverage_per_claim: model.bigNumber().default(500),
  max_total_coverage: model.bigNumber().default(5000),
  
  // Eligibility
  is_eligible: model.boolean().default(false),
  eligibility_date: model.dateTime().nullable(), // When they became eligible
  months_active: model.number().default(0),
  chargeback_rate: model.bigNumber().default(0), // Current chargeback rate
  
  // Status
  status: model.enum([
    "BUILDING",    // Building pool, not yet eligible
    "ACTIVE",      // Fully active protection
    "SUSPENDED",   // Suspended due to high chargebacks
    "INACTIVE",
  ]).default("BUILDING"),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Chargeback Claim
 * Individual chargeback claims against protection pool
 */
export const ChargebackClaim = model.define("hawala_chargeback_claim", {
  id: model.id().primaryKey(),
  
  // References
  protection_id: model.text(),
  vendor_id: model.text(),
  order_id: model.text(),
  ledger_entry_id: model.text().nullable(),
  
  // Chargeback details
  chargeback_amount: model.bigNumber(),
  covered_amount: model.bigNumber(), // Amount covered by pool
  vendor_liability: model.bigNumber(), // Amount vendor owes
  
  // Stripe chargeback
  stripe_dispute_id: model.text().nullable(),
  dispute_reason: model.text().nullable(),
  
  // Status
  status: model.enum([
    "PENDING",
    "APPROVED",
    "PARTIALLY_COVERED",
    "DENIED",
    "RESOLVED",
  ]).default("PENDING"),
  
  // Resolution
  resolved_at: model.dateTime().nullable(),
  resolution_notes: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
