import { model } from "@medusajs/framework/utils"
import { BadgeType } from "./verification"

/**
 * Badge Status
 */
export enum BadgeStatus {
  PENDING = "PENDING",     // Application submitted
  ACTIVE = "ACTIVE",       // Badge granted and visible
  SUSPENDED = "SUSPENDED", // Temporarily suspended
  REVOKED = "REVOKED",     // Permanently revoked
  EXPIRED = "EXPIRED",     // Time-based badge expired
}

/**
 * Vendor Badge
 * 
 * Trust indicators displayed on vendor profiles.
 * Each badge has verification requirements and can be clicked
 * by consumers to see what it means.
 */
const VendorBadge = model.define("vendor_badge", {
  id: model.id().primaryKey(),
  
  // Link to seller
  seller_id: model.text(),
  
  // Badge type
  badge_type: model.enum(Object.values(BadgeType)),
  
  // Status
  status: model.enum(Object.values(BadgeStatus)).default(BadgeStatus.PENDING),
  
  // Display priority (lower = more prominent)
  display_order: model.number().default(100),
  
  // When granted
  granted_at: model.dateTime().nullable(),
  
  // Expiration (if applicable)
  expires_at: model.dateTime().nullable(),
  
  // Who granted it
  granted_by: model.text().nullable(),
  
  // Supporting documentation
  documentation_url: model.text().nullable(),
  
  // External certification details (if applicable)
  certification_number: model.text().nullable(),
  certifying_body: model.text().nullable(),
  
  // Consumer-visible explanation
  description: model.text().nullable(),
  
  // Click-through URL (learn more)
  learn_more_url: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["seller_id"],
      name: "IDX_vendor_badge_seller_id",
    },
    {
      on: ["badge_type"],
      name: "IDX_vendor_badge_type",
    },
    {
      on: ["status"],
      name: "IDX_vendor_badge_status",
    },
    {
      on: ["seller_id", "badge_type"],
      name: "IDX_vendor_badge_seller_type",
      unique: true,
    },
  ])

export default VendorBadge
