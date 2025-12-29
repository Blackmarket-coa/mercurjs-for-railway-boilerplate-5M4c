/**
 * Food Distribution Module Workflows
 * 
 * Comprehensive workflow system for food distribution supporting:
 * 
 * PRODUCER TYPES:
 * - Restaurants, Ghost Kitchens, Cottage Food, Food Banks
 * - Mutual Aid, Cooperatives, Farms, CSAs, Food Trucks
 * 
 * TRANSACTION TYPES:
 * - Sales, Donations, Trades, Community Shares, Food Rescue
 * 
 * DELIVERY LIFECYCLE:
 * 1. Order placed → Delivery created
 * 2. Producer notified
 * 3. Courier claims delivery
 * 4. Producer starts preparation
 * 5. Order ready for pickup
 * 6. Courier picks up order
 * 7. Courier delivers order
 * 8. Delivery confirmed with proof
 * 
 * Each step in the workflow can be tracked and resumed via API.
 */

export * from "./steps"
export * from "./workflows"
