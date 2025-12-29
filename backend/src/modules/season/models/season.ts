import { model } from "@medusajs/framework/utils"

/**
 * Garden Season Model
 * 
 * Represents a growing season for a garden with planning,
 * planting, growing, and harvest phases.
 */
export const GardenSeason = model.define("garden_season", {
  id: model.id().primaryKey(),
  garden_id: model.text(),
  
  name: model.text(), // "Spring 2025", "Year-Round 2025"
  year: model.number(),
  season_type: model.enum(["spring", "summer", "fall", "winter", "year_round"]),
  
  // Phase dates
  planning_start: model.dateTime(),
  planting_start: model.dateTime(),
  growing_start: model.dateTime(),
  harvest_start: model.dateTime(),
  season_end: model.dateTime(),
  
  // Status
  status: model.enum(["planning", "planting", "growing", "harvesting", "complete", "cancelled"]).default("planning"),
  
  // Goals
  goals: model.json().nullable(), // { tomatoes_lbs: 500, volunteer_hours: 200, plots_filled: 20, etc }
  
  // Budget
  planned_budget: model.bigNumber().nullable(),
  actual_spent: model.bigNumber().default(0),
  
  // Participation
  target_volunteers: model.number().nullable(),
  target_plot_holders: model.number().nullable(),
  
  // Results (filled after season)
  results: model.json().nullable(), // { total_harvest_lbs, total_value, volunteer_hours, etc }
  
  // Weather notes
  weather_notes: model.text().nullable(),
  
  // Lessons learned
  retrospective: model.text().nullable(),
  
  metadata: model.json().nullable(),
})
