import { model } from "@medusajs/framework/utils"

/**
 * Vendor Type Enum
 *
 * Defines the category of seller for feature gating,
 * UI specialization, and commission logic.
 *
 * Types:
 * - producer: Farms, food producers, ranchers
 * - garden: Community gardens, urban farms
 * - kitchen: Commercial community kitchens, shared-use kitchens
 * - maker: Artisans, crafters, cottage food producers
 * - restaurant: Restaurants, ghost kitchens, food trucks
 * - mutual_aid: Mutual aid networks, community organizations
 */
export enum VendorType {
  PRODUCER = "producer",
  GARDEN = "garden",
  KITCHEN = "kitchen",
  MAKER = "maker",
  RESTAURANT = "restaurant",
  MUTUAL_AID = "mutual_aid",
}

/**
 * Social Media Links Interface
 * Stores URLs for various social media platforms
 */
export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
  pinterest?: string
}

/**
 * External Storefront Links Interface
 * Stores URLs for other platforms where the vendor sells
 */
export interface StorefrontLinks {
  website?: string
  etsy?: string
  amazon?: string
  shopify?: string
  ebay?: string
  farmers_market?: string
  other?: { name: string; url: string }[]
}

/**
 * Seller Metadata - Extension for MercurJS Seller
 * 
 * Since we can't modify the @mercurjs/b2c-core seller model directly,
 * we create a linked metadata table that extends seller capabilities.
 * 
 * This table is linked 1:1 with the seller table via seller_id.
 */
const SellerMetadata = model.define("seller_metadata", {
  id: model.id().primaryKey(),
  
  // Link to MercurJS seller (will be linked via module link)
  seller_id: model.text().unique(),
  
  // Vendor type classification
  vendor_type: model.enum(Object.values(VendorType)).default(VendorType.PRODUCER),
  
  // Extended business information
  business_registration_number: model.text().nullable(),
  tax_classification: model.text().nullable(),
  
  // Social media links (JSON object with platform keys)
  social_links: model.json().nullable(), // SocialLinks type
  
  // External storefront links (where else they sell)
  storefront_links: model.json().nullable(), // StorefrontLinks type
  
  // Primary website URL (quick access)
  website_url: model.text().nullable(),
  
  // Agricultural-specific fields (used when vendor_type = FARM)
  farm_practices: model.json().nullable(), // organic, regenerative, conventional, etc.
  certifications: model.json().nullable(), // USDA Organic, Fair Trade, etc.
  growing_region: model.text().nullable(),
  
  // Restaurant-specific fields (used when vendor_type = RESTAURANT)
  cuisine_types: model.json().nullable(),
  service_types: model.json().nullable(), // dine-in, takeout, delivery, catering
  
  // General extended fields
  featured: model.boolean().default(false),
  verified: model.boolean().default(false),
  rating: model.float().nullable(),
  review_count: model.number().default(0),
  
  // Metadata for additional extensions
  metadata: model.json().nullable(),
})
  .indexes([
    {
      on: ["vendor_type"],
      name: "IDX_seller_metadata_vendor_type",
    },
    {
      on: ["featured"],
      name: "IDX_seller_metadata_featured",
    },
  ])

export default SellerMetadata
