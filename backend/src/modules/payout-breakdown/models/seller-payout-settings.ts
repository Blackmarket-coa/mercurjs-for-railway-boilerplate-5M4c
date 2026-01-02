import { model } from "@medusajs/framework/utils"

/**
 * Seller Payout Settings
 * 
 * Per-seller customization of payout settings.
 * Can override platform defaults.
 */
const SellerPayoutSettings = model.define("seller_payout_settings", {
  id: model.id().primaryKey(),
  
  // Link to seller
  seller_id: model.text().unique(),
  
  // === Fee Overrides ===
  
  // Custom platform fee (null = use default)
  custom_platform_fee_percent: model.number().nullable(),
  
  // Fee reduction reason (negotiated, promotional, etc.)
  fee_reduction_reason: model.text().nullable(),
  
  // Fee reduction expires at
  fee_reduction_expires_at: model.dateTime().nullable(),
  
  // === Payout Preferences ===
  
  // Preferred payout method
  payout_method: model.enum([
    "STRIPE",
    "BANK_TRANSFER",
    "CHECK",
    "CRYPTO",
    "HAWALA",
  ]).default("STRIPE"),
  
  // Custom payout frequency (null = use default)
  custom_payout_frequency_days: model.number().nullable(),
  
  // Instant payout enabled
  instant_payout_enabled: model.boolean().default(false),
  
  // === Transparency Settings ===
  
  // Show fee breakdown in orders to customers
  show_breakdown: model.boolean().default(true),
  
  // Custom transparency message
  transparency_message: model.text().nullable(),
  
  // === Community Contribution ===
  
  // Additional community fund contribution (%)
  additional_community_contribution: model.number().default(0),
  
  // Community contribution message
  community_contribution_message: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

export default SellerPayoutSettings
