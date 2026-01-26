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
 * This is the CUSTOMER-FACING "farm profile" that builds trust
 * and transparency in the barn-to-door model.
 *
 * RELATIONSHIP WITH SELLER_METADATA:
 * ----------------------------------
 * Both producer and seller_metadata have some overlapping fields
 * (certifications, social_links). Here's the distinction:
 *
 * producer (this model):
 *   - CUSTOMER-FACING profile for PRODUCER type sellers only
 *   - Farm story/narrative content for marketing
 *   - Location info (region, coordinates) for local discovery
 *   - Farm details (size, year established) for transparency
 *   - Public gallery/media for trust building
 *   - Growing practices and certifications displayed to customers
 *
 * seller_metadata (seller-extension module):
 *   - INTERNAL/ADMIN data for ALL seller types
 *   - vendor_type classification (producer, garden, maker, etc.)
 *   - Business info (tax ID, registration numbers)
 *   - Platform status (verified badge, featured flag, rating)
 *   - Type-specific operational fields
 *
 * In summary:
 *   producer = marketing/transparency data for storefront
 *   seller_metadata = operational data for backend/admin
 *
 * A producer-type seller will have BOTH:
 *   - seller_metadata (with vendor_type="producer", business info)
 *   - producer profile (with farm story, location, gallery)
 *
 * The storefront displays the producer profile to customers,
 * while admin/vendor panels use seller_metadata for operations.
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
