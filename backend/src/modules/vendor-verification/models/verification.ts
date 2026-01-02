import { model } from "@medusajs/framework/utils"

/**
 * Verification Status Levels
 * 
 * Progressive trust levels:
 * - UNVERIFIED: New vendor, no verification
 * - SELF_REPORTED: Vendor submitted info, not verified
 * - VERIFIED: Platform verified basic information
 * - AUDITED: Third-party or on-site audit completed
 * - CERTIFIED: Holds recognized certifications (USDA Organic, etc.)
 */
export enum VerificationLevel {
  UNVERIFIED = "UNVERIFIED",
  SELF_REPORTED = "SELF_REPORTED",
  VERIFIED = "VERIFIED",
  AUDITED = "AUDITED",
  CERTIFIED = "CERTIFIED",
}

/**
 * Verification Types
 * 
 * Different aspects that can be verified
 */
export enum VerificationType {
  IDENTITY = "IDENTITY",           // Real name/business verification
  LOCATION = "LOCATION",           // Physical location verified
  PRODUCTION = "PRODUCTION",       // Production facility verified
  PRACTICES = "PRACTICES",         // Growing/production practices verified
  CERTIFICATION = "CERTIFICATION", // External certification verified
  BANK_ACCOUNT = "BANK_ACCOUNT",  // Payout account verified
  TAX_INFO = "TAX_INFO",          // Tax information verified
}

/**
 * Badge Types
 * 
 * Visual trust indicators shown to consumers
 */
export enum BadgeType {
  VERIFIED_PRODUCER = "VERIFIED_PRODUCER",
  LOCAL_PRODUCER = "LOCAL_PRODUCER",
  ORGANIC_CERTIFIED = "ORGANIC_CERTIFIED",
  REGENERATIVE = "REGENERATIVE",
  FAIR_TRADE = "FAIR_TRADE",
  WOMAN_OWNED = "WOMAN_OWNED",
  BLACK_OWNED = "BLACK_OWNED",
  VETERAN_OWNED = "VETERAN_OWNED",
  COOPERATIVE = "COOPERATIVE",
  FAMILY_FARM = "FAMILY_FARM",
  B_CORP = "B_CORP",
  ZERO_WASTE = "ZERO_WASTE",
  CARBON_NEUTRAL = "CARBON_NEUTRAL",
  COMMUNITY_SUPPORTED = "COMMUNITY_SUPPORTED",
}

/**
 * Vendor Verification
 * 
 * Core verification record for a seller.
 * Tracks overall verification status and level.
 */
const VendorVerification = model.define("vendor_verification", {
  id: model.id().primaryKey(),
  
  // Link to seller
  seller_id: model.text().unique(),
  
  // Overall verification level
  level: model.enum(Object.values(VerificationLevel)).default(VerificationLevel.UNVERIFIED),
  
  // Verification score (0-100, computed from individual checks)
  trust_score: model.number().default(0),
  
  // Years active on platform
  years_active: model.number().default(0),
  
  // Production scale (helps set expectations)
  production_scale: model.enum([
    "HOME_BASED",      // Cottage/home production
    "SMALL",           // 1-5 employees
    "MEDIUM",          // 6-25 employees
    "LARGE",           // 26+ employees
  ]).default("SMALL"),
  
  // Last verification date
  last_verified_at: model.dateTime().nullable(),
  
  // Next scheduled verification
  next_verification_due: model.dateTime().nullable(),
  
  // Verification notes (internal)
  internal_notes: model.text().nullable(),
  
  // Public verification statement
  verification_statement: model.text().nullable(),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["seller_id"],
      name: "IDX_vendor_verification_seller_id",
    },
    {
      on: ["level"],
      name: "IDX_vendor_verification_level",
    },
    {
      on: ["trust_score"],
      name: "IDX_vendor_verification_trust_score",
    },
  ])

export default VendorVerification
