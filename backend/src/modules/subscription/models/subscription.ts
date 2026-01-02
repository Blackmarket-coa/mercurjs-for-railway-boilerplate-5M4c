import { model } from "@medusajs/framework/utils"
import { SubscriptionInterval, SubscriptionStatus, SubscriptionType } from "../types"

/**
 * Subscription Model
 * 
 * Represents a recurring subscription for products/services.
 * Supports various subscription types common in food systems:
 * - CSA shares (weekly/monthly produce boxes)
 * - Meal plans (restaurant subscriptions)
 * - Garden memberships
 * - Cooperative memberships
 */
const Subscription = model.define("subscription", {
  id: model.id().primaryKey(),
  
  // Subscription configuration
  status: model.enum(SubscriptionStatus)
    .default(SubscriptionStatus.ACTIVE),
  type: model.enum(SubscriptionType)
    .default(SubscriptionType.CUSTOM),
  interval: model.enum(SubscriptionInterval),
  period: model.number(), // Number of intervals (e.g., 12 for yearly monthly subscription)
  
  // Relationships (linked via module links)
  seller_id: model.text().nullable(),
  customer_id: model.text().nullable(),
  product_id: model.text().nullable(),
  variant_id: model.text().nullable(),
  
  // Order details
  quantity: model.number().default(1),
  
  // Dates
  subscription_date: model.dateTime(), // When subscription started
  last_order_date: model.dateTime(),   // Last order created
  next_order_date: model.dateTime().index().nullable(), // Next scheduled order
  expiration_date: model.dateTime().index(), // When subscription ends
  paused_at: model.dateTime().nullable(), // When paused (if paused)
  canceled_at: model.dateTime().nullable(), // When canceled (if canceled)
  
  // Payment
  stripe_subscription_id: model.text().nullable(), // For Stripe-managed subscriptions
  payment_method_id: model.text().nullable(), // Saved payment method
  
  // Delivery preferences
  delivery_day: model.text().nullable(), // Preferred delivery day (e.g., "tuesday")
  delivery_instructions: model.text().nullable(),
  
  metadata: model.json().nullable(),
})

export default Subscription
