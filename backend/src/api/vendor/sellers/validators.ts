import { z } from "zod"
import { VendorType } from "../../../modules/seller-extension/models/seller-metadata"

/**
 * Social Links Schema
 */
const socialLinksSchema = z.object({
  instagram: z.string().url().optional(),
  facebook: z.string().url().optional(),
  twitter: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  youtube: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  pinterest: z.string().url().optional(),
}).optional()

/**
 * Create Seller Request Schema
 *
 * Validates the request body for POST /vendor/sellers
 * Accepts all fields needed for seller creation + metadata
 */
export const createSellerSchema = z.object({
  // Core seller fields
  name: z.string().min(1, "Seller name is required"),

  // Member information
  member: z.object({
    name: z.string().min(1, "Member name is required"),
    email: z.string().email("Valid email is required"),
  }),

  // Extended metadata fields
  vendor_type: z.enum(["producer", "garden", "maker", "restaurant", "mutual_aid"]).optional(),
  website_url: z.string().url().optional().nullable(),
  social_links: socialLinksSchema,
})

export type CreateSellerInput = z.infer<typeof createSellerSchema>
