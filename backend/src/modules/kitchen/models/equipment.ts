import { model } from "@medusajs/framework/utils"

/**
 * Kitchen Equipment Model
 *
 * Tracks major equipment in a commercial community kitchen,
 * including maintenance schedules and availability.
 */
export const KitchenEquipment = model.define("kitchen_equipment", {
  id: model.id().primaryKey(),
  kitchen_id: model.text(),
  space_id: model.text().nullable(), // Which station it belongs to, if any

  // Identity
  name: model.text(),
  description: model.text().nullable(),
  manufacturer: model.text().nullable(),
  model_number: model.text().nullable(),
  serial_number: model.text().nullable(),

  // Category
  category: model.enum([
    "cooking",          // Ovens, ranges, fryers
    "refrigeration",    // Fridges, freezers, walk-ins
    "prep",             // Mixers, processors, slicers
    "storage",          // Shelving, racks
    "cleaning",         // Dishwashers, sinks
    "smallwares",       // Pots, pans, utensils
    "packaging",        // Vacuum sealers, labelers
    "safety"            // Fire suppression, first aid
  ]),

  // Status
  status: model.enum(["operational", "maintenance", "repair", "retired"]).default("operational"),

  // Financials
  purchase_date: model.dateTime().nullable(),
  purchase_price: model.bigNumber().nullable(),
  current_value: model.bigNumber().nullable(),
  warranty_expires: model.dateTime().nullable(),

  // Maintenance
  last_service_date: model.dateTime().nullable(),
  next_service_due: model.dateTime().nullable(),
  service_interval_days: model.number().nullable(),
  maintenance_notes: model.text().nullable(),

  // Usage tracking
  requires_training: model.boolean().default(false),
  training_materials_url: model.text().nullable(),
  authorized_users: model.json().nullable(), // Member IDs who can use this equipment

  // Safety
  safety_certifications: model.json().nullable(),
  safety_notes: model.text().nullable(),

  metadata: model.json().nullable(),
})
