import { InferTypeOf } from "@medusajs/framework/types"
import Subscription from "../models/subscription"

/**
 * Subscription Status
 * 
 * Tracks the lifecycle of a subscription:
 * - ACTIVE: Currently running, will renew
 * - PAUSED: Temporarily paused by customer or admin
 * - CANCELED: Customer canceled, no more renewals
 * - EXPIRED: Reached end of subscription period
 * - FAILED: Payment or other failure
 */
export enum SubscriptionStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  CANCELED = "canceled",
  EXPIRED = "expired",
  FAILED = "failed"
}

/**
 * Subscription Interval
 * 
 * Defines the billing cycle:
 * - WEEKLY: Weekly renewals (great for CSA boxes)
 * - BIWEEKLY: Every two weeks
 * - MONTHLY: Monthly billing
 * - QUARTERLY: Every 3 months
 * - YEARLY: Annual subscriptions
 */
export enum SubscriptionInterval {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly"
}

/**
 * Subscription Type
 * 
 * Different subscription models:
 * - CSA_SHARE: Farm share subscription
 * - MEAL_PLAN: Restaurant meal subscription
 * - PRODUCE_BOX: Curated produce delivery
 * - MEMBERSHIP: Garden/coop membership
 * - CUSTOM: Custom subscription type
 */
export enum SubscriptionType {
  CSA_SHARE = "csa_share",
  MEAL_PLAN = "meal_plan",
  PRODUCE_BOX = "produce_box",
  MEMBERSHIP = "membership",
  CUSTOM = "custom"
}

export type CreateSubscriptionData = {
  interval: SubscriptionInterval
  period: number
  type?: SubscriptionType
  status?: SubscriptionStatus
  subscription_date?: Date
  seller_id?: string
  customer_id?: string
  product_id?: string
  variant_id?: string
  quantity?: number
  metadata?: Record<string, unknown>
}

export type SubscriptionData = InferTypeOf<typeof Subscription>
