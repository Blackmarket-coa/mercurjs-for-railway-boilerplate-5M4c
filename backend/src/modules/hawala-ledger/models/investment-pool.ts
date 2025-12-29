import { model } from "@medusajs/framework/utils"

/**
 * Investment Pool
 * Producer-specific investment pools where customers can micro-invest
 * 
 * Features:
 * - Automatic micro-investment from purchases (optional)
 * - Producer revenue sharing with investors
 * - Seasonal funding for farm operations
 */
export const InvestmentPool = model.define("hawala_investment_pool", {
  id: model.id().primaryKey(),
  
  // Pool identification
  name: model.text(),
  description: model.text().nullable(),
  
  // Producer reference
  producer_id: model.text(), // Links to producer module
  
  // Linked ledger account (PRODUCER_POOL type)
  ledger_account_id: model.text(),
  
  // Investment terms
  target_amount: model.bigNumber(), // Target raise amount
  minimum_investment: model.bigNumber().default(1), // Min per investor
  maximum_investment: model.bigNumber().nullable(), // Max per investor
  
  // ROI structure
  roi_type: model.enum([
    "FIXED_RATE",       // Fixed percentage return
    "REVENUE_SHARE",    // Share of producer revenue
    "PRODUCT_CREDIT",   // Returns as store credit
    "HYBRID",           // Combination
  ]).default("REVENUE_SHARE"),
  roi_rate: model.float().nullable(), // For FIXED_RATE: annual percentage
  fixed_roi_rate: model.float().nullable(), // Fixed ROI rate alias
  revenue_share_percentage: model.float().nullable(), // For REVENUE_SHARE
  product_credit_multiplier: model.float().nullable(), // For PRODUCT_CREDIT
  
  // Timeline
  start_date: model.dateTime().nullable(), // Pool start date
  end_date: model.dateTime().nullable(), // Pool end date
  fundraising_start: model.dateTime().nullable(),
  fundraising_end: model.dateTime().nullable(),
  maturity_date: model.dateTime().nullable(), // When investments mature
  
  // Progress tracking
  total_raised: model.bigNumber().default(0),
  total_investors: model.number().default(0),
  total_distributed: model.bigNumber().default(0), // Total ROI distributed
  
  // Status
  status: model.enum([
    "DRAFT",
    "FUNDRAISING",
    "FUNDED",
    "ACTIVE",       // Generating returns
    "DISTRIBUTING", // Paying out returns
    "COMPLETED",
    "CANCELLED",
  ]).default("DRAFT"),
  
  // Auto-investment settings
  auto_invest_enabled: model.boolean().default(false),
  auto_invest_percentage: model.float().nullable(), // % of order to invest
  
  // Photo/media
  cover_image: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

/**
 * Investment Record
 * Individual investment by a customer into a pool
 */
export const Investment = model.define("hawala_investment", {
  id: model.id().primaryKey(),
  
  // References
  pool_id: model.text(), // Investment pool
  investor_account_id: model.text(), // Investor's ledger account
  customer_id: model.text().nullable(), // Customer who invested
  
  // Investment details
  amount: model.bigNumber(),
  currency_code: model.text().default("USD"),
  
  // Returns tracking
  expected_return: model.bigNumber().nullable(),
  actual_return: model.bigNumber().default(0),
  return_distributed: model.bigNumber().default(0),
  
  // Status
  status: model.enum([
    "PENDING",
    "CONFIRMED",
    "EARNING",
    "MATURED",
    "WITHDRAWN",
    "CANCELLED",
  ]).default("PENDING"),
  
  // Source
  source: model.enum([
    "DIRECT",         // Direct investment
    "AUTO_ORDER",     // Auto-invest from order
    "GIFT",           // Gifted investment
  ]).default("DIRECT"),
  source_order_id: model.text().nullable(),
  
  // Ledger entry reference
  ledger_entry_id: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
  
  invested_at: model.dateTime(),
  matured_at: model.dateTime().nullable(),
  withdrawn_at: model.dateTime().nullable(),
})
