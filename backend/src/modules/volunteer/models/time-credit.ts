import { model } from "@medusajs/framework/utils"

/**
 * Time Credit Model
 * 
 * Represents volunteer time credits that can be redeemed
 * for harvests or other garden benefits.
 */
export const TimeCredit = model.define("garden_time_credit", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  customer_id: model.text(),
  membership_id: model.text(),
  
  // Credit amount
  amount: model.bigNumber(), // In currency units (e.g., $15 = 1 hour)
  hours_equivalent: model.bigNumber(),
  
  // Source
  source_type: model.enum([
    "volunteer_log",  // From logged hours
    "work_party",     // Bonus from organized event
    "gift",           // Transferred from another member
    "bonus",          // Admin-granted bonus
    "adjustment"      // Manual adjustment
  ]),
  source_id: model.text().nullable(), // volunteer_log_id or work_party_id
  
  // Rate used
  hourly_rate: model.bigNumber(),
  
  // Status
  status: model.enum(["pending", "available", "redeemed", "expired", "cancelled"]).default("pending"),
  
  // Redemption
  redeemed_at: model.dateTime().nullable(),
  redeemed_for_type: model.text().nullable(), // "harvest_claim", "plot_fee", etc.
  redeemed_for_id: model.text().nullable(),
  
  // Expiration
  expires_at: model.dateTime().nullable(),
  
  // Ledger
  credit_ledger_entry_id: model.text().nullable(),
  redemption_ledger_entry_id: model.text().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
