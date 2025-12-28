import { model } from "@medusajs/framework/utils"

/**
 * Farm/Growing Practices
 */
export enum GrowingPractice {
  ORGANIC = "ORGANIC",
  CERTIFIED_ORGANIC = "CERTIFIED_ORGANIC",
  REGENERATIVE = "REGENERATIVE",
  CONVENTIONAL = "CONVENTIONAL",
  BIODYNAMIC = "BIODYNAMIC",
  PERMACULTURE = "PERMACULTURE",
  HYDROPONIC = "HYDROPONIC",
  AQUAPONIC = "AQUAPONIC",
  NO_SPRAY = "NO_SPRAY",
  IPM = "IPM", // Integrated Pest Management
}

/**
 * Producer
 * 
 * Represents a farm, food hub, or primary producer.
 * Linked to a MercurJS seller via seller_id.
 * 
 * This is the customer-visible "farm profile" that builds trust
 * and transparency in the barn-to-door model.
 */
const Producer = model.define("producer", {
  id: model.id().primaryKey(),
  
  // Link to MercurJS seller
  seller_id: model.text().unique(),
  
  // Basic information
  name: model.text().searchable(),
  handle: model.text().unique(),
  description: model.text().nullable(),
  
  // Location (region-level, not exact address for privacy)
  region: model.text().nullable(),
  state: model.text().nullable(),
  country_code: model.text().nullable(),
  latitude: model.float().nullable(),
  longitude: model.float().nullable(),
  
  // Farm/producer details
  farm_size_acres: model.float().nullable(),
  year_established: model.number().nullable(),
  
  // Growing practices (stored as JSON array)
  practices: model.json().nullable(), // GrowingPractice[]
  
  // Certifications (stored as JSON array of certification objects)
  // { name: string, issuer: string, valid_until?: Date, document_url?: string }
  certifications: model.json().nullable(),
  
  // Producer story/narrative (customer-visible)
  story: model.text().nullable(),
  
  // Media
  photo: model.text().nullable(),
  cover_image: model.text().nullable(),
  gallery: model.json().nullable(), // string[] of image URLs
  
  // Social/contact
  website: model.text().nullable(),
  social_links: model.json().nullable(), // { facebook?: string, instagram?: string, etc. }
  
  // Visibility
  public_profile_enabled: model.boolean().default(true),
  featured: model.boolean().default(false),
  
  // Verification status
  verified: model.boolean().default(false),
  verified_at: model.dateTime().nullable(),
  
  // Metadata for extensions
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["seller_id"],
      name: "IDX_producer_seller_id",
    },
    {
      on: ["handle"],
      name: "IDX_producer_handle",
    },
    {
      on: ["region"],
      name: "IDX_producer_region",
    },
    {
      on: ["public_profile_enabled"],
      name: "IDX_producer_public",
    },
    {
      on: ["featured"],
      name: "IDX_producer_featured",
    },
  ])

export default Producer
