/**
 * Phase 1: Domain Architecture Types
 * 
 * Shared types for vendor classification and product archetypes.
 */

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

export const VendorTypeLabels: Record<VendorType, string> = {
  [VendorType.FARM]: "Farm / Producer",
  [VendorType.RESTAURANT]: "Restaurant",
  [VendorType.DISTRIBUTOR]: "Distributor / Food Hub",
  [VendorType.CREATOR]: "Digital Creator",
  [VendorType.RETAIL]: "Retail Vendor",
}

/**
 * Product Archetype Enum
 * 
 * Defines the behavioral category of a product.
 */
export enum ProductArchetypeCode {
  AGRICULTURAL_RAW = "AGRICULTURAL_RAW",
  AGRICULTURAL_PROCESSED = "AGRICULTURAL_PROCESSED",
  RESTAURANT_PREPARED = "RESTAURANT_PREPARED",
  NON_PERISHABLE = "NON_PERISHABLE",
  DIGITAL = "DIGITAL",
  TICKET = "TICKET",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export const ProductArchetypeLabels: Record<ProductArchetypeCode, string> = {
  [ProductArchetypeCode.AGRICULTURAL_RAW]: "Raw Agricultural Products",
  [ProductArchetypeCode.AGRICULTURAL_PROCESSED]: "Processed Agricultural Products",
  [ProductArchetypeCode.RESTAURANT_PREPARED]: "Restaurant Prepared Food",
  [ProductArchetypeCode.NON_PERISHABLE]: "Non-Perishable Goods",
  [ProductArchetypeCode.DIGITAL]: "Digital Products",
  [ProductArchetypeCode.TICKET]: "Event Tickets",
  [ProductArchetypeCode.SUBSCRIPTION]: "Subscription Products",
}

/**
 * Inventory Strategy
 */
export enum InventoryStrategy {
  STANDARD = "STANDARD",
  LOT_BASED = "LOT_BASED",
  UNLIMITED = "UNLIMITED",
  CAPACITY = "CAPACITY",
  NONE = "NONE",
}

/**
 * Seller Metadata DTO
 * 
 * Extended seller information including vendor_type.
 */
export interface SellerMetadataDTO {
  id: string
  seller_id: string
  vendor_type: VendorType
  business_registration_number?: string | null
  tax_classification?: string | null
  farm_practices?: Record<string, any> | null
  certifications?: Record<string, any>[] | null
  growing_region?: string | null
  cuisine_types?: string[] | null
  service_types?: string[] | null
  featured: boolean
  verified: boolean
  rating?: number | null
  review_count: number
  metadata?: Record<string, any> | null
  created_at: string
  updated_at: string
}

/**
 * Product Archetype DTO
 */
export interface ProductArchetypeDTO {
  id: string
  code: ProductArchetypeCode
  name: string
  description?: string | null
  inventory_strategy: InventoryStrategy
  requires_availability_window: boolean
  supports_preorder: boolean
  perishable: boolean
  perishable_shelf_days?: number | null
  requires_shipping: boolean
  supports_pickup: boolean
  supports_delivery: boolean
  fulfillment_lead_time_hours?: number | null
  refundable: boolean
  return_window_days?: number | null
  tax_category?: string | null
  requires_lot_tracking: boolean
  supports_surplus_pricing: boolean
  requires_producer_link: boolean
  metadata?: Record<string, any> | null
}

/**
 * Product Archetype Assignment DTO
 */
export interface ProductArchetypeAssignmentDTO {
  id: string
  product_id: string
  archetype_id: string
  archetype?: ProductArchetypeDTO
  override_refundable?: boolean | null
  override_return_window_days?: number | null
  override_fulfillment_lead_time_hours?: number | null
  metadata?: Record<string, any> | null
}

/**
 * Extended Seller DTO (includes metadata)
 */
export interface ExtendedSellerDTO {
  id: string
  name: string
  handle: string
  description?: string | null
  email?: string | null
  phone?: string | null
  photo?: string | null
  address_line?: string | null
  postal_code?: string | null
  city?: string | null
  state?: string | null
  country_code?: string | null
  tax_id?: string | null
  store_status: "ACTIVE" | "INACTIVE" | "SUSPENDED"
  created_at: string
  updated_at: string
  // Extended fields from seller_metadata
  seller_metadata?: SellerMetadataDTO | null
}
