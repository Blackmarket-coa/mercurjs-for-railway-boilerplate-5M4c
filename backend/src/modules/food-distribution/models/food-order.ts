import { model } from "@medusajs/framework/utils"

/**
 * Transaction Types
 * 
 * The core concept: not all food transfers are sales.
 * This supports the full solidarity economy spectrum.
 */
export enum TransactionType {
  // Commercial
  SALE = "SALE",               // Standard purchase
  PREPAID = "PREPAID",         // Paid in advance (meal plans, subscriptions)
  
  // Community/Solidarity
  DONATION = "DONATION",       // Free food (food bank, mutual aid)
  TRADE = "TRADE",             // Barter/exchange
  GIFT = "GIFT",               // Gift from one person to another
  COMMUNITY_SHARE = "COMMUNITY_SHARE", // CSA style share
  
  // Special
  RESCUE = "RESCUE",           // Food rescue (surplus food redistribution)
  GLEANING = "GLEANING",       // Harvesting surplus from farms
}

/**
 * Order Status
 */
export enum FoodOrderStatus {
  // Initial
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  
  // Producer rejected
  DECLINED = "DECLINED",
  CANCELLED = "CANCELLED",
  
  // Preparation
  PREPARING = "PREPARING",
  READY = "READY",
  
  // Handoff
  PICKED_UP = "PICKED_UP",       // By customer or courier
  
  // Delivery (if applicable)
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  
  // Issues
  FAILED_DELIVERY = "FAILED_DELIVERY",
  RETURNED = "RETURNED",
  
  // Complete
  COMPLETED = "COMPLETED",
}

/**
 * Fulfillment Type
 */
export enum FulfillmentType {
  PICKUP = "PICKUP",           // Customer picks up
  DELIVERY = "DELIVERY",       // Delivered to customer
  DINE_IN = "DINE_IN",         // For restaurants
  CURBSIDE = "CURBSIDE",       // Curbside pickup
  LOCKER = "LOCKER",           // Smart locker pickup
  COMMUNITY_POINT = "COMMUNITY_POINT", // Community pickup point
}

/**
 * FoodOrder Model
 * 
 * Represents an order of food - supports sales, trades, donations.
 * This is separate from Medusa's Order to handle the unique needs
 * of food distribution including real-time status, trading, and donations.
 */
export const FoodOrder = model.define("food_order", {
  id: model.id().primaryKey(),
  
  // Order Number (human readable)
  order_number: model.text().unique(),
  
  // Transaction Type
  transaction_type: model.enum(TransactionType).default(TransactionType.SALE),
  
  // Link to Medusa Order (if sale)
  medusa_order_id: model.text().nullable(),
  medusa_cart_id: model.text().nullable(),
  
  // Producer (source of food)
  producer_id: model.text(),
  
  // Customer/Recipient
  customer_id: model.text().nullable(),         // Medusa customer ID
  recipient_name: model.text(),
  recipient_phone: model.text().nullable(),
  recipient_email: model.text().nullable(),
  
  // For donations/mutual aid - allow anonymous
  anonymous_recipient: model.boolean().default(false),
  
  // Status
  status: model.enum(FoodOrderStatus).default(FoodOrderStatus.PENDING),
  status_history: model.json().nullable(), // [{ status, timestamp, note }]
  
  // Fulfillment
  fulfillment_type: model.enum(FulfillmentType).default(FulfillmentType.DELIVERY),
  
  // Delivery Address (if delivery)
  delivery_address_line_1: model.text().nullable(),
  delivery_address_line_2: model.text().nullable(),
  delivery_city: model.text().nullable(),
  delivery_state: model.text().nullable(),
  delivery_postal_code: model.text().nullable(),
  delivery_country_code: model.text().nullable(),
  delivery_latitude: model.float().nullable(),
  delivery_longitude: model.float().nullable(),
  delivery_instructions: model.text().nullable(),
  
  // Pickup details (if pickup)
  pickup_time_requested: model.dateTime().nullable(),
  pickup_time_confirmed: model.dateTime().nullable(),
  pickup_instructions: model.text().nullable(),
  
  // Items (JSON array of order items)
  // [{ product_id, variant_id, name, quantity, unit_price, total, notes, dietary_info }]
  items: model.json(),
  
  // Pricing (for sales)
  subtotal: model.bigNumber().default(0),
  tax: model.bigNumber().default(0),
  delivery_fee: model.bigNumber().default(0),
  tip: model.bigNumber().default(0),
  discount: model.bigNumber().default(0),
  total: model.bigNumber().default(0),
  
  // Trade details (for trades)
  trade_offer_description: model.text().nullable(), // What they're offering in return
  trade_offer_value: model.bigNumber().nullable(),
  trade_accepted: model.boolean().nullable(),
  
  // Donation details (for donations)
  is_recurring_donation: model.boolean().default(false),
  donation_source: model.text().nullable(), // Food bank, mutual aid org, etc.
  food_rescue_source: model.text().nullable(), // For rescued food
  
  // Payment
  payment_status: model.enum(["PENDING", "PAID", "FAILED", "REFUNDED", "NOT_APPLICABLE"]).default("PENDING"),
  payment_method: model.text().nullable(),
  payment_reference: model.text().nullable(),
  paid_at: model.dateTime().nullable(),
  
  // For community currency / hawala
  hawala_transaction_id: model.text().nullable(),
  
  // Timing
  ordered_at: model.dateTime(),
  confirmed_at: model.dateTime().nullable(),
  estimated_ready_at: model.dateTime().nullable(),
  actual_ready_at: model.dateTime().nullable(),
  estimated_delivery_at: model.dateTime().nullable(),
  actual_delivery_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),
  
  // Preparation
  prep_started_at: model.dateTime().nullable(),
  prep_notes: model.text().nullable(),
  
  // Special Handling
  requires_temperature_control: model.boolean().default(false),
  contains_allergens: model.json().nullable(), // ["nuts", "dairy", "gluten"]
  dietary_restrictions: model.json().nullable(), // ["vegan", "halal", "kosher"]
  
  // Customer Communication
  customer_notes: model.text().nullable(),
  producer_notes: model.text().nullable(),
  
  // Ratings (after completion)
  customer_rating: model.number().nullable(), // 1-5
  customer_review: model.text().nullable(),
  producer_response: model.text().nullable(),
  
  // Issue Tracking
  has_issue: model.boolean().default(false),
  issue_type: model.text().nullable(),
  issue_description: model.text().nullable(),
  issue_resolved: model.boolean().default(false),
  
  // Workflow
  workflow_transaction_id: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    { on: ["order_number"], name: "IDX_food_order_number" },
    { on: ["producer_id"], name: "IDX_food_order_producer" },
    { on: ["customer_id"], name: "IDX_food_order_customer" },
    { on: ["status"], name: "IDX_food_order_status" },
    { on: ["transaction_type"], name: "IDX_food_order_txn_type" },
    { on: ["medusa_order_id"], name: "IDX_food_order_medusa" },
    { on: ["ordered_at"], name: "IDX_food_order_date" },
  ])

/**
 * FoodOrderItem Model (if we want full normalization)
 * 
 * Individual line items in an order
 */
export const FoodOrderItem = model.define("food_order_item", {
  id: model.id().primaryKey(),
  
  order: model.belongsTo(() => FoodOrder, { mappedBy: "items_normalized" }),
  
  // Product reference
  product_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  
  // Item details
  name: model.text(),
  description: model.text().nullable(),
  quantity: model.number().default(1),
  unit: model.text().default("each"), // "each", "lb", "oz", "serving"
  
  // Pricing
  unit_price: model.bigNumber().default(0),
  total: model.bigNumber().default(0),
  
  // Customizations
  customizations: model.json().nullable(), // [{ name, choice, price_adjustment }]
  
  // Special notes
  notes: model.text().nullable(),
  
  // Dietary info
  dietary_info: model.json().nullable(), // { vegan: true, gluten_free: false }
  allergens: model.json().nullable(), // ["peanuts", "dairy"]
  
  // For trades/donations
  estimated_value: model.bigNumber().nullable(),
  
  // Preparation status
  status: model.enum(["PENDING", "PREPARING", "READY", "PACKED"]).default("PENDING"),
  
  // Expiration (for food safety)
  best_by: model.dateTime().nullable(),
  storage_instructions: model.text().nullable(),
})
