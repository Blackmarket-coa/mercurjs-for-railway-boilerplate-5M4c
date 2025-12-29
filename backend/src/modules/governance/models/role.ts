import { model } from "@medusajs/framework/utils"

/**
 * Garden Role Model
 * 
 * Defines roles within a garden and their permissions.
 */
export const GardenRole = model.define("garden_role", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  name: model.text(), // "Treasurer", "Plot Coordinator", etc.
  slug: model.text(),
  description: model.text().nullable(),
  
  // Role type
  role_type: model.enum([
    "elected",      // Elected by vote
    "appointed",    // Appointed by other role
    "automatic",    // Based on membership type
    "volunteer"     // Self-assigned
  ]),
  
  // Permissions
  permissions: model.json(), // string[] of permission codes
  
  // Voting power bonus
  voting_power_bonus: model.bigNumber().default(0),
  
  // Can this role appoint other roles?
  can_appoint: model.json().nullable(), // role slugs this role can appoint
  
  // Term limits
  term_months: model.number().nullable(),
  max_consecutive_terms: model.number().nullable(),
  
  // Capacity
  max_holders: model.number().nullable(), // null = unlimited
  min_holders: model.number().nullable(),
  
  // Active
  is_active: model.boolean().default(true),
  
  // System role (cannot be deleted)
  is_system: model.boolean().default(false),
  
  metadata: model.json().nullable(),
})

/**
 * Role Assignment Model
 * 
 * Tracks who holds which roles.
 */
export const RoleAssignment = model.define("garden_role_assignment", {
  id: model.id().primaryKey(),
  role_id: model.text(),
  garden_id: model.text(),
  customer_id: model.text(),
  membership_id: model.text(),
  
  // Assignment details
  assigned_at: model.dateTime(),
  assigned_by_id: model.text().nullable(),
  assignment_method: model.enum(["elected", "appointed", "automatic", "volunteered"]),
  
  // Term
  term_start: model.dateTime(),
  term_end: model.dateTime().nullable(),
  term_number: model.number().default(1),
  
  // Status
  status: model.enum(["active", "on_leave", "suspended", "ended"]).default("active"),
  ended_at: model.dateTime().nullable(),
  end_reason: model.enum(["term_complete", "resigned", "removed", "replaced"]).nullable(),
  
  // Election (if elected)
  election_proposal_id: model.text().nullable(),
  
  notes: model.text().nullable(),
  metadata: model.json().nullable(),
})
