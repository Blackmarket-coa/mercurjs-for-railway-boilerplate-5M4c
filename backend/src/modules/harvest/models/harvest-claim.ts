import { model } from "@medusajs/framework/utils"

/**
 * Harvest Claim Model
 * 
 * Represents a member's claim on their portion of a harvest allocation.
 */
export const HarvestClaim = model.define("garden_harvest_claim", {
  id: model.id().primaryKey(),
  allocation_id: model.text(),
  harvest_id: model.text(),
  garden_id: model.text(),
  customer_id: model.text(),
  membership_id: model.text(),
  
  // What they're claiming
  quantity_entitled: model.bigNumber(), // What they're entitled to
  quantity_claimed: model.bigNumber(),  // What they actually want
  unit: model.text(),
  
  // Basis for claim
  claim_basis: model.enum([
    "volunteer_hours",
    "investment",
    "plot_holder",
    "membership",
    "gift",
    "purchase"
  ]),
  
  // Credits/value used (for volunteer or investment-based claims)
  credits_used: model.bigNumber().nullable(),
  credit_type: model.text().nullable(), // "volunteer_credit", "harvest_credit"
  
  // If purchased
  purchase_amount: model.bigNumber().nullable(),
  payment_id: model.text().nullable(),
  
  // Fulfillment
  status: model.enum([
    "pending",       // Claim submitted
    "approved",      // Claim approved
    "ready",         // Ready for pickup
    "picked_up",     // Picked up by member
    "delivered",     // Delivered to member
    "expired",       // Not claimed in time
    "forfeited",     // Member gave up claim
    "redistributed"  // Redistributed to others
  ]).default("pending"),
  
  // Pickup/delivery
  fulfillment_type: model.enum(["pickup", "delivery"]).default("pickup"),
  pickup_date: model.dateTime().nullable(),
  pickup_location: model.text().nullable(),
  picked_up_at: model.dateTime().nullable(),
  delivered_at: model.dateTime().nullable(),
  
  // Delivery details (if delivered)
  delivery_address: model.json().nullable(),
  delivery_notes: model.text().nullable(),
  
  // Ledger tracking
  ledger_entry_id: model.text().nullable(),
  
  // Notifications
  notified_at: model.dateTime().nullable(),
  reminder_sent_at: model.dateTime().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
