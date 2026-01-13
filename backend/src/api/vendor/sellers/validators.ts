import { z } from "zod"

/**
 * Vendor types available for sellers
 * Must match VendorType enum in seller-extension module
 */
export const vendorTypeEnum = z.enum([
  "producer",
  "garden",
  "kitchen",
  "maker",
  "restaurant",
  "mutual_aid",
])

/**
 * Create Seller Request Schema
 *
 * Validates the request body for POST /vendor/sellers
 * Accepts core fields needed for seller registration request.
 * The request will be submitted for admin approval.
 * Once approved, the seller entity and metadata will be created.
 */
export const createSellerSchema = z.object({
  // Core seller fields
  name: z.string().min(1, "Seller name is required"),

  // Vendor type selection (optional, defaults to "producer" if not provided)
  vendor_type: vendorTypeEnum.optional(),

  // Member information
  member: z.object({
    name: z.string().min(1, "Member name is required"),
    email: z.string().email("Valid email is required"),
  }),
})

export type CreateSellerInput = z.infer<typeof createSellerSchema>
