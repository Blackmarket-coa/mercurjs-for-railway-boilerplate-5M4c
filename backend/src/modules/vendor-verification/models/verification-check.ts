import { model } from "@medusajs/framework/utils"
import { VerificationType } from "./verification"

/**
 * Check Status
 */
export enum CheckStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  PASSED = "PASSED",
  FAILED = "FAILED",
  EXPIRED = "EXPIRED",
  WAIVED = "WAIVED",
}

/**
 * Verification Check
 * 
 * Individual verification check for a specific aspect.
 * Forms the history of verification activities.
 */
const VerificationCheck = model.define("verification_check", {
  id: model.id().primaryKey(),
  
  // Link to parent verification
  vendor_verification_id: model.text(),
  
  // Type of verification
  check_type: model.enum(Object.values(VerificationType)),
  
  // Status
  status: model.enum(Object.values(CheckStatus)).default(CheckStatus.PENDING),
  
  // Who performed the check
  verified_by: model.text().nullable(), // admin user id or "system"
  
  // When verified
  verified_at: model.dateTime().nullable(),
  
  // Expiration (some checks expire)
  expires_at: model.dateTime().nullable(),
  
  // Evidence/documentation
  documents: model.json().nullable(), // { url: string, type: string, uploaded_at: Date }[]
  
  // Check-specific data
  check_data: model.json().nullable(),
  
  // Notes
  notes: model.text().nullable(),
  
  // Score contribution (0-100)
  score_contribution: model.number().default(0),
  
  // Metadata
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["vendor_verification_id"],
      name: "IDX_vcheck_verification_id",
    },
    {
      on: ["check_type"],
      name: "IDX_vcheck_type",
    },
    {
      on: ["status"],
      name: "IDX_vcheck_status",
    },
    {
      on: ["expires_at"],
      name: "IDX_vcheck_expires",
    },
  ])

export default VerificationCheck
