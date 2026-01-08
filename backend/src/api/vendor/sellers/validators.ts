import { z } from "zod"

/**
 * Create Seller Request Schema
 *
 * Validates the request body for POST /vendor/sellers
 * Accepts core fields needed for seller creation.
 * Metadata (including vendor_type) is created by the seller-created subscriber.
 */
export const createSellerSchema = z.object({
  // Core seller fields
  name: z.string().min(1, "Seller name is required"),

  // Member information
  member: z.object({
    name: z.string().min(1, "Member name is required"),
    email: z.string().email("Valid email is required"),
  }),
})

export type CreateSellerInput = z.infer<typeof createSellerSchema>
