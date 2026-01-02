import { model } from "@medusajs/framework/utils"

/**
 * Buyer Badge Types
 */
export enum BuyerBadgeType {
  FIRST_PURCHASE = "FIRST_PURCHASE",
  LOCAL_SUPPORTER = "LOCAL_SUPPORTER",         // 5+ purchases from local producers
  CO_OP_BUYER = "CO_OP_BUYER",                 // Joined a co-op or buying club
  REGENERATIVE_PATRON = "REGENERATIVE_PATRON", // Supports regenerative farms
  SUBSCRIPTION_SUPPORTER = "SUBSCRIPTION_SUPPORTER", // Active subscription
  COMMUNITY_CHAMPION = "COMMUNITY_CHAMPION",   // $500+ to producers
  PRODUCER_PARTNER = "PRODUCER_PARTNER",       // $1000+ to producers
  LOYAL_CUSTOMER = "LOYAL_CUSTOMER",           // 12+ months active
  IMPACT_LEADER = "IMPACT_LEADER",             // Top 10% impact
  REFERRAL_STAR = "REFERRAL_STAR",             // Referred 5+ customers
}

/**
 * Buyer Badge
 * 
 * Badges earned by customers for their impact.
 * Creates identity and belonging.
 */
const BuyerBadge = model.define("buyer_badge", {
  id: model.id().primaryKey(),
  
  // Badge definition
  badge_type: model.enum(Object.values(BuyerBadgeType)).unique(),
  
  // Display info
  name: model.text(),
  description: model.text(),
  icon: model.text(),
  color: model.text(),
  
  // Requirements (JSON)
  requirements: model.json().nullable(),
  
  // Display order
  display_order: model.number().default(100),
  
  // Active status
  active: model.boolean().default(true),
  
  // Metadata
  metadata: model.json().nullable(),
})

export default BuyerBadge
