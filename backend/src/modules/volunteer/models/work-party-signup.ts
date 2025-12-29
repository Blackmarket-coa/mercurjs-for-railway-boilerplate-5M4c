import { model } from "@medusajs/framework/utils"

/**
 * Work Party Signup Model
 * 
 * Tracks volunteer signups for work party events.
 */
export const WorkPartySignup = model.define("garden_work_party_signup", {
  id: model.id().primaryKey(),
  work_party_id: model.text(),
  garden_id: model.text(),
  customer_id: model.text(),
  membership_id: model.text(),
  
  // Status
  status: model.enum([
    "signed_up",
    "confirmed",
    "attended",
    "no_show",
    "cancelled"
  ]).default("signed_up"),
  
  // Attendance
  checked_in_at: model.dateTime().nullable(),
  checked_out_at: model.dateTime().nullable(),
  actual_hours: model.bigNumber().nullable(),
  
  // Tasks taken
  tasks_completed: model.json().nullable(), // string[]
  
  // Special roles
  is_lead: model.boolean().default(false),
  lead_area: model.text().nullable(),
  
  // Notes from organizer
  organizer_notes: model.text().nullable(),
  
  // Volunteer notes
  volunteer_notes: model.text().nullable(),
  
  // Signup time
  signed_up_at: model.dateTime(),
  confirmed_at: model.dateTime().nullable(),
  cancelled_at: model.dateTime().nullable(),
  cancellation_reason: model.text().nullable(),
  
  metadata: model.json().nullable(),
})
