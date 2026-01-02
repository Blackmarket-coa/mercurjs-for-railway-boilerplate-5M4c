import { model } from "@medusajs/framework/utils"

/**
 * Fulfillment Method
 */
export enum FulfillmentMethod {
  DELIVERY = "DELIVERY",
  PICKUP = "PICKUP",
  SHIPPING = "SHIPPING",
  LOCAL_PICKUP = "LOCAL_PICKUP",
  FARMERS_MARKET = "FARMERS_MARKET",
}

/**
 * Day of Week
 */
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Vendor Rules
 * 
 * Core settings that give vendors control over their sales.
 * "Vendors must feel ownership, not dependency."
 */
const VendorRules = model.define("vendor_rules", {
  id: model.id().primaryKey(),
  
  // Link to seller
  seller_id: model.text().unique(),
  
  // === Order Minimums ===
  
  // Minimum order value (cents)
  min_order_value: model.number().default(0),
  
  // Minimum order items
  min_order_items: model.number().default(1),
  
  // === Fulfillment Rules ===
  
  // Allowed fulfillment methods
  allowed_fulfillment_methods: model.json(), // FulfillmentMethod[]
  
  // Lead time (hours before order must be placed)
  lead_time_hours: model.number().default(24),
  
  // Max delivery distance (miles, 0 = unlimited)
  max_delivery_distance: model.number().default(0),
  
  // Delivery days
  delivery_days: model.json().nullable(), // DayOfWeek[]
  
  // Pickup days
  pickup_days: model.json().nullable(), // DayOfWeek[]
  
  // === Communication Preferences ===
  
  // Allow direct buyer messages
  allow_direct_messages: model.boolean().default(true),
  
  // Require order-related context for messages
  require_order_context: model.boolean().default(false),
  
  // Auto-respond when unavailable
  auto_respond_enabled: model.boolean().default(false),
  auto_respond_message: model.text().nullable(),
  
  // === Pricing Control ===
  
  // Allow price negotiation (for wholesale, etc.)
  allow_price_negotiation: model.boolean().default(false),
  
  // Minimum negotiation quantity
  negotiation_min_quantity: model.number().default(10),
  
  // === Visibility ===
  
  // Public profile visible
  profile_visible: model.boolean().default(true),
  
  // Products visible in search
  products_searchable: model.boolean().default(true),
  
  // Show in vendor directory
  show_in_directory: model.boolean().default(true),
  
  // === Order Limits ===
  
  // Max orders per day (0 = unlimited)
  max_orders_per_day: model.number().default(0),
  
  // Max orders per week (0 = unlimited)
  max_orders_per_week: model.number().default(0),
  
  // === Vacation/Pause ===
  
  // Currently accepting orders
  accepting_orders: model.boolean().default(true),
  
  // Pause reason (shown to customers)
  pause_message: model.text().nullable(),
  
  // Auto-resume date
  resume_date: model.dateTime().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})

export default VendorRules
