import { model } from "@medusajs/framework/utils"

/**
 * Work Party Model
 * 
 * Represents an organized volunteer event at the garden.
 * Work parties often have bonus credit multipliers.
 */
export const WorkParty = model.define("garden_work_party", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  season_id: model.text().nullable(),
  
  // Event details
  name: model.text(),
  description: model.text().nullable(),
  
  // Timing
  date: model.dateTime(),
  start_time: model.dateTime(),
  end_time: model.dateTime(),
  duration_hours: model.bigNumber(),
  
  // Capacity
  max_volunteers: model.number().nullable(),
  min_volunteers: model.number().nullable(),
  current_signups: model.number().default(0),
  actual_attendance: model.number().nullable(),
  
  // Focus activities
  activity_types: model.json(), // string[]
  tasks: model.json().nullable(), // [{ task, description, volunteers_needed }]
  
  // Status
  status: model.enum([
    "draft",
    "scheduled",
    "open",         // Open for signups
    "full",         // Max capacity reached
    "in_progress",
    "complete",
    "cancelled"
  ]).default("draft"),
  
  // Organizer
  organizer_id: model.text(),
  co_organizer_ids: model.json().nullable(), // string[]
  
  // Credit bonus for participation
  credit_multiplier: model.bigNumber().default(1), // 1.5 = 50% bonus
  bonus_reason: model.text().nullable(),
  
  // Requirements
  requirements: model.text().nullable(), // What to bring, wear, etc.
  skill_level: model.enum(["beginner", "intermediate", "advanced", "all"]).default("all"),
  
  // Location details
  meeting_point: model.text().nullable(),
  parking_info: model.text().nullable(),
  
  // Weather contingency
  rain_date: model.dateTime().nullable(),
  weather_cancellation_policy: model.text().nullable(),
  
  // Refreshments
  refreshments_provided: model.boolean().default(false),
  refreshments_notes: model.text().nullable(),
  
  // Results
  total_volunteer_hours: model.bigNumber().nullable(),
  accomplishments: model.text().nullable(),
  
  // Photos
  photo_urls: model.json().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
