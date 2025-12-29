import { model } from "@medusajs/framework/utils"

/**
 * Settlement Batch
 * Groups ledger entries for periodic blockchain settlement
 * 
 * Settlement Process:
 * 1. Collect unsettled entries since last batch
 * 2. Calculate net positions per account
 * 3. Create Stellar multi-payment transaction
 * 4. Compute Merkle root of all entries
 * 5. Anchor Merkle root to Stellar
 * 6. Mark entries as settled
 */
export const SettlementBatch = model.define("hawala_settlement_batch", {
  id: model.id().primaryKey(),
  
  // Batch identification
  batch_number: model.number().unique(), // Sequential batch number
  
  // Time range
  period_start: model.dateTime(),
  period_end: model.dateTime(),
  
  // Totals
  total_entries: model.number().default(0),
  total_volume: model.bigNumber().default(0), // Sum of all entry amounts
  net_settlement_amount: model.bigNumber().default(0), // Net amount to settle
  currency_code: model.text().default("USD"),
  
  // Status
  status: model.enum([
    "PENDING",      // Batch created, collecting entries
    "PROCESSING",   // Settlement in progress
    "SUBMITTED",    // Submitted to Stellar
    "CONFIRMED",    // Confirmed on blockchain
    "FAILED",       // Settlement failed
  ]).default("PENDING"),
  
  // Merkle root for audit (SHA-256 hash of all entry hashes)
  merkle_root: model.text().nullable(),
  
  // Stellar blockchain references
  stellar_tx_hash: model.text().nullable(),
  stellar_ledger_sequence: model.number().nullable(),
  stellar_fee_paid: model.bigNumber().nullable(), // XLM fee paid
  
  // Error handling
  error_message: model.text().nullable(),
  retry_count: model.number().default(0),
  
  // Metadata
  metadata: model.json().nullable(),
  
  created_at: model.dateTime(),
  updated_at: model.dateTime(),
  submitted_at: model.dateTime().nullable(),
  confirmed_at: model.dateTime().nullable(),
})
