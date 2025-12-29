import { Module } from "@medusajs/framework/utils"
import SeasonModuleService from "./service"

/**
 * Season Module
 * 
 * Manages growing seasons and plantings including:
 * - Season creation and phase management
 * - Planting tracking and yield estimation
 * - Growing plan templates
 * - Crop rotation guidance
 */
export const SEASON_MODULE = "seasonModuleService"

export default Module(SEASON_MODULE, {
  service: SeasonModuleService,
})

export * from "./models"
