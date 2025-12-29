import { model } from "@medusajs/framework/utils"

/**
 * Volunteer Log Model
 * 
 * Records volunteer hours contributed to a garden.
 * Forms the basis for time banking and harvest credits.
 */
export const VolunteerLog = model.define("volunteer_log", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  customer_id: model.text(),
  membership_id: model.text(),
  
  // Activity details
  activity_type: model.enum([
    "planting",
    "weeding",
    "watering",
    "harvesting",
    "maintenance",    // Fence repair, path clearing, etc.
    "composting",
    "mulching",
    "pest_control",
    "tool_maintenance",
    "teaching",       // Leading workshops
    "coordination",   // Organizing activities
    "administration", // Paperwork, planning
    "outreach",       // Community engagement
    "fundraising",
    "other"
  ]),
  description: model.text().nullable(),
  
  // Time
  date: model.dateTime(),
  start_time: model.dateTime().nullable(),
  end_time: model.dateTime().nullable(),
  hours: model.bigNumber(),
  
  // Location in garden
  plot_id: model.text().nullable(),
  area: model.text().nullable(), // "Communal beds", "Tool shed", etc.
  
  // Verification
  verified_by_id: model.text().nullable(),
  verification_status: model.enum(["pending", "verified", "disputed", "rejected"]).default("pending"),
  verified_at: model.dateTime().nullable(),
  verification_notes: model.text().nullable(),
  
  // Self-verification for trusted members
  self_verified: model.boolean().default(false),
  
  // Ledger integration
  ledger_entry_id: model.text().nullable(),
  credits_earned: model.bigNumber().nullable(),
  credit_rate: model.bigNumber().nullable(), // $/hour rate used
  
  // Work party (if part of organized event)
  work_party_id: model.text().nullable(),
  
  // Bonus credits
  bonus_multiplier: model.bigNumber().default(1),
  bonus_reason: model.text().nullable(),
  
  // Photos/evidence
  photo_urls: model.json().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
