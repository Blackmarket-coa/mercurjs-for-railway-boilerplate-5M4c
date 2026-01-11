import { model } from "@medusajs/framework/utils"

/**
 * Kitchen Space Model
 *
 * Represents a rentable workstation or space within a commercial
 * community kitchen. Each kitchen can have multiple spaces with
 * different equipment and pricing.
 */
export const KitchenSpace = model.define("kitchen_space", {
  id: model.id().primaryKey(),
  kitchen_id: model.text(),

  // Identity
  name: model.text(), // "Station A", "Prep Area 1", "Cold Kitchen", etc.
  description: model.text().nullable(),

  // Physical attributes
  size_sqft: model.number().nullable(),
  section: model.text().nullable(), // "Main Kitchen", "Bakery", "Cold Prep", etc.

  // Type
  space_type: model.enum([
    "general",          // General prep workstation
    "bakery",           // Bakery-specific station
    "cold_prep",        // Cold prep area
    "hot_line",         // Hot cooking line
    "packaging",        // Packaging and labeling area
    "storage_cold",     // Cold storage rental
    "storage_dry",      // Dry storage rental
    "full_kitchen"      // Full kitchen rental (exclusive use)
  ]),

  // Equipment at this station
  equipment: model.json().nullable(), // ["mixer", "oven", "range", "fryer", etc.]

  // Pricing
  hourly_rate: model.bigNumber().nullable(), // Override kitchen default
  daily_rate: model.bigNumber().nullable(),
  weekly_rate: model.bigNumber().nullable(),
  monthly_rate: model.bigNumber().nullable(),

  // Capacity
  max_users: model.number().default(1),

  // Status
  status: model.enum(["available", "reserved", "maintenance", "unavailable"]).default("available"),

  // Current assignment (for longer-term rentals)
  assigned_member_id: model.text().nullable(),
  assignment_type: model.enum(["hourly", "daily", "weekly", "monthly", "reserved"]).nullable(),
  assignment_starts: model.dateTime().nullable(),
  assignment_ends: model.dateTime().nullable(),

  // Features
  has_water_access: model.boolean().default(true),
  has_gas: model.boolean().default(false),
  has_hood_ventilation: model.boolean().default(false),
  is_accessible: model.boolean().default(true), // ADA accessible

  // Maintenance
  last_deep_clean: model.dateTime().nullable(),
  last_equipment_service: model.dateTime().nullable(),
  maintenance_notes: model.text().nullable(),

  metadata: model.json().nullable(),
})
