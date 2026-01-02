/**
 * Shared TypeScript types for FreeBlackMarket.com
 * 
 * These interfaces replace `any` types throughout the codebase
 * for improved type safety and IDE support.
 */

// ===========================================
// BADGE & IMPACT TYPES
// ===========================================

/**
 * Badge type identifiers for buyer achievements
 */
export enum BuyerBadgeType {
  FIRST_PURCHASE = "first_purchase",
  LOCAL_SUPPORTER = "local_supporter",
  CO_OP_BUYER = "co_op_buyer",
  REGENERATIVE_PATRON = "regenerative_patron",
  SUBSCRIPTION_SUPPORTER = "subscription_supporter",
  COMMUNITY_CHAMPION = "community_champion",
  PRODUCER_PARTNER = "producer_partner",
}

/**
 * Requirements for earning a buyer badge
 */
export interface BadgeRequirements {
  total_orders?: number
  local_orders?: number
  is_coop_member?: boolean
  regenerative_orders?: number
  has_active_subscription?: boolean
  total_to_producers?: number // in cents
  months_active?: number
  percentile?: number
  referrals?: number
  [key: string]: unknown // Allow additional dynamic properties
}

/**
 * Badge definition for display
 */
export interface BuyerBadgeDefinition {
  badge_type: BuyerBadgeType
  name: string
  description: string
  icon: string
  color: string
  requirements: BadgeRequirements
  display_order: number
}

/**
 * Impact data for an order (used by impact-metrics service)
 */
export interface OrderImpactData {
  id?: string
  order_id: string
  customer_id: string
  order_total: number // cents
  producer_amount: number // cents
  platform_fee: number // cents
  delivery_fee: number // cents
  community_reinvestment: number // cents
  tip_amount: number // cents
  producer_breakdown: Record<string, unknown>
  food_miles: number
  miles_saved: number
  is_local: boolean
  is_repeat: boolean
  order_type: "ONE_TIME" | "SUBSCRIPTION" | "PRE_ORDER" | "STANDING"
  created_at?: Date
}

/**
 * Producer breakdown item for order impact calculation
 */
export interface ProducerBreakdownItem {
  seller_id: string
  amount: number // cents
  percentage?: number
}

// ===========================================
// DELIVERY TYPES
// ===========================================

/**
 * Delivery status values
 */
export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "WAITING_FOR_ORDER"
  | "ORDER_PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"

/**
 * Entry in delivery status history
 */
export interface StatusHistoryEntry {
  status: DeliveryStatus
  timestamp: string | Date
  note?: string
  actor: string // ID of user who made the change
}

/**
 * GeoJSON Geometry type (simplified for our use case)
 */
export interface GeoJSONGeometry {
  type: "Point" | "Polygon" | "MultiPolygon" | "LineString" | "MultiLineString"
  coordinates: number[] | number[][] | number[][][] | number[][][][]
}

/**
 * Service hours for a delivery zone
 */
export interface ServiceHours {
  day: string
  open: string // HH:MM format
  close: string // HH:MM format
  enabled: boolean
}

/**
 * Delivery zone configuration
 */
export interface DeliveryZone {
  id: string
  name: string
  seller_id: string
  geojson?: GeoJSONGeometry
  zip_codes?: string[]
  radius_miles?: number
  center_lat?: number
  center_lng?: number
  service_hours?: ServiceHours[]
  delivery_fee: number // cents
  min_order: number // cents
  estimated_time_minutes: number
  is_active: boolean
  created_at: Date
  updated_at: Date
}

// ===========================================
// SUBSCRIPTION TYPES
// ===========================================

/**
 * Subscription frequency intervals
 */
export type SubscriptionInterval = 
  | "weekly" 
  | "biweekly" 
  | "monthly" 
  | "quarterly" 
  | "yearly"

/**
 * Types of subscriptions offered
 */
export type SubscriptionType = 
  | "csa_share" 
  | "meal_plan" 
  | "produce_box" 
  | "membership" 
  | "custom"

/**
 * Subscription lifecycle status
 */
export type SubscriptionStatus = 
  | "active" 
  | "paused" 
  | "cancelled" 
  | "expired" 
  | "pending"

/**
 * Subscription record
 */
export interface Subscription {
  id: string
  customer_id: string
  seller_id?: string
  cart_id?: string
  type: SubscriptionType
  status: SubscriptionStatus
  interval: SubscriptionInterval
  period: number
  delivery_day?: string
  delivery_instructions?: string
  next_renewal_at: Date
  last_renewed_at?: Date
  cancelled_at?: Date
  cancellation_reason?: string
  created_at: Date
  updated_at: Date
}

// ===========================================
// PRODUCT & VARIANT TYPES
// ===========================================

/**
 * Product variant option
 */
export interface VariantOption {
  option_id: string
  option: {
    title: string
  }
  value: string
}

/**
 * Pricing information for a variant
 */
export interface VariantPrice {
  currency_code: string
  amount: number // in cents
}

/**
 * Product variant with pricing
 */
export interface ProductVariant {
  id: string
  title: string
  sku?: string
  barcode?: string
  options?: VariantOption[]
  prices?: VariantPrice[]
  inventory_quantity?: number
  manage_inventory: boolean
}

// ===========================================
// TICKET/EVENT TYPES
// ===========================================

/**
 * Ticket product for events
 */
export interface TicketProduct {
  id: string
  product_id: string
  venue_id: string
  seller_id: string
  event_date: Date
  event_time?: string
  doors_open?: string
  capacity: number
  sold_count: number
  created_at: Date
}

/**
 * Ticket purchase record
 */
export interface TicketPurchase {
  id: string
  ticket_product_id: string
  variant_id: string
  order_id: string
  customer_id: string
  seat_info?: string
  row_number?: number
  seat_number?: number
  is_verified: boolean
  verified_at?: Date
  qr_code?: string
  created_at: Date
}

// ===========================================
// FILE UPLOAD TYPES
// ===========================================

/**
 * Uploaded file from Multer
 */
export interface UploadedFile {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  buffer: Buffer
}

/**
 * Media file result from upload workflow
 */
export interface MediaFileResult {
  id: string
  url: string
  filename: string
  mime_type: string
  size: number
}

// ===========================================
// PAYOUT & FINANCIAL TYPES
// ===========================================

/**
 * Payout configuration for a vendor
 */
export interface PayoutConfig {
  vendor_id: string
  payout_method: "stripe" | "ach" | "stellar" | "manual"
  payout_schedule: "daily" | "weekly" | "monthly"
  minimum_payout: number // cents
  stripe_account_id?: string
  ach_account?: {
    routing_number: string
    account_number_last4: string
    account_type: "checking" | "savings"
  }
  stellar_address?: string
  is_verified: boolean
}

/**
 * Split rule for revenue sharing
 */
export interface PayoutSplitRule {
  id: string
  vendor_id: string
  recipient_type: "producer" | "platform" | "charity" | "custom"
  recipient_id?: string
  percentage: number // 0-100
  description?: string
  is_active: boolean
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number
  limit: number
  offset: number
}

/**
 * Standard error response
 */
export interface ApiError {
  message: string
  type: string
  code?: string
  details?: unknown
}

// ===========================================
// UTILITY TYPES
// ===========================================

/**
 * Make all properties in T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Extract the type of array elements
 */
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never

/**
 * Make specific properties required
 */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
