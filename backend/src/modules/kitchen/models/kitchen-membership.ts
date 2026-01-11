import { model } from "@medusajs/framework/utils"

/**
 * Kitchen Membership Model
 *
 * Represents a member's relationship with a commercial community kitchen,
 * including their roles, balances, and governance participation.
 */
export const KitchenMembership = model.define("kitchen_membership", {
  id: model.id().primaryKey(),
  kitchen_id: model.text(),
  customer_id: model.text(),

  // Type
  membership_type: model.enum([
    "hourly",           // Pay-per-use hourly rental
    "monthly",          // Monthly membership
    "annual",           // Annual membership
    "incubator",        // Business incubator program member
    "investor",         // Financial supporter
    "staff",            // Kitchen staff member
    "volunteer"         // Community volunteer
  ]),

  // Status
  status: model.enum(["pending", "active", "suspended", "expired", "cancelled"]).default("pending"),

  // Business Info (for food entrepreneurs)
  business_name: model.text().nullable(),
  business_type: model.text().nullable(), // "catering", "meal_prep", "bakery", etc.
  food_handler_cert_number: model.text().nullable(),
  food_handler_cert_expires: model.dateTime().nullable(),
  liability_insurance: model.boolean().default(false),

  // Balances (denormalized for quick access, derived from ledger)
  prepaid_hours_balance: model.bigNumber().default(0),
  deposit_balance: model.bigNumber().default(0),
  investment_balance: model.bigNumber().default(0),

  // Usage Tracking
  total_hours_used: model.bigNumber().default(0),
  hours_this_month: model.bigNumber().default(0),

  // Governance
  voting_power: model.bigNumber().default(1),
  roles: model.json().nullable(), // ["treasurer", "scheduler", "equipment_manager", etc.]

  // Scheduling preferences
  preferred_times: model.json().nullable(), // { monday: ["morning", "evening"], ... }
  recurring_bookings: model.json().nullable(), // Standing reservations

  // Emergency contact
  emergency_contact: model.json().nullable(), // { name, phone, relationship }

  // Agreements
  waiver_signed_at: model.dateTime().nullable(),
  rules_accepted_at: model.dateTime().nullable(),
  food_safety_acknowledged_at: model.dateTime().nullable(),

  // Dates
  joined_at: model.dateTime(),
  expires_at: model.dateTime().nullable(),
  renewed_at: model.dateTime().nullable(),

  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
