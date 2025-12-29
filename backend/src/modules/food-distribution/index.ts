import { Module } from "@medusajs/framework/utils"
import FoodDistributionService from "./service"

/**
 * Food Distribution Module
 * 
 * A comprehensive module for food distribution supporting the solidarity economy:
 * 
 * PRODUCER TYPES:
 * - Restaurants (full service, fast food)
 * - Ghost Kitchens (delivery-only)
 * - Cottage Food Producers (home-based, licensed under cottage food laws)
 * - Home Bakers
 * - Food Banks
 * - Mutual Aid Organizations
 * - Cooperatives
 * - Farms
 * - CSAs (Community Supported Agriculture)
 * - Food Hubs
 * - Commercial Kitchens
 * - Caterers
 * - Food Trucks
 * - Pop-ups
 * 
 * TRANSACTION TYPES:
 * - Sale (standard commercial transaction)
 * - Prepaid (paid in advance)
 * - Donation (free, charitable giving)
 * - Trade (barter/exchange)
 * - Gift (no payment expected)
 * - Community Share (community distribution)
 * - Rescue (food waste reduction)
 * - Gleaning (harvesting excess crops)
 * 
 * COURIER TYPES:
 * - Independent Contractors
 * - Employees
 * - Volunteers
 * - Community Members
 * - Cooperative Members
 * 
 * FEATURES:
 * - Real-time GPS tracking
 * - Proof of delivery (photo, signature, PIN)
 * - Batch deliveries for efficiency
 * - Delivery zones with dynamic pricing
 * - Temperature monitoring for food safety
 * - Support for EBT/SNAP payments
 * - Hawala integration for alternative payments
 * - Anonymous recipients for donations
 */
export const FOOD_DISTRIBUTION_MODULE = "foodDistribution"

export default Module(FOOD_DISTRIBUTION_MODULE, {
  service: FoodDistributionService,
})
