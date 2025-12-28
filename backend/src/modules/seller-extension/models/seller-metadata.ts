import { model } from "@medusajs/framework/utils"

/**
 * Vendor Type Enum
 * 
 * Defines the category of seller for feature gating, 
 * UI specialization, and commission logic.
 */
export enum VendorType {
  FARM = "FARM",
  RESTAURANT = "RESTAURANT", 
  DISTRIBUTOR = "DISTRIBUTOR",
  CREATOR = "CREATOR",
  RETAIL = "RETAIL",
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
  vendor_type: model.enum(Object.values(VendorType)).default(VendorType.RETAIL),
  
  // Extended business information
  business_registration_number: model.text().nullable(),
  tax_classification: model.text().nullable(),
  
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
