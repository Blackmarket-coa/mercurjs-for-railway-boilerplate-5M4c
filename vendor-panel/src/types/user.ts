import { HttpTypes } from "@medusajs/types"

export type VendorTypeValue = "producer" | "garden" | "maker" | "restaurant" | "mutual_aid"

export interface Review {
  id: string
  rating: number
  customer_id: string
  customer_note: string
  created_at: string
  reference: string
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  twitter?: string
  tiktok?: string
  youtube?: string
  linkedin?: string
  pinterest?: string
}

export interface StorefrontLinks {
  website?: string
  etsy?: string
  amazon?: string
  shopify?: string
  ebay?: string
  farmers_market?: string
  other?: { name: string; url: string }[]
}

export interface StoreVendor {
  id?: string
  name?: string
  phone?: string
  email?: string
  description?: string
  handle?: string
  photo?: string
  created_at?: string
  product?: HttpTypes.StoreProduct[]
  review?: Review | Review[]
  address_line?: string
  postal_code?: string
  city?: string
  country_code?: string
  tax_id?: string
  store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE"
  // Vendor type classification
  vendor_type?: VendorTypeValue
  // Social media and storefront links
  social_links?: SocialLinks
  storefront_links?: StorefrontLinks
  website_url?: string
}

export interface TeamMemberProps {
  id: string
  seller_id: string
  name: string
  email?: string
  photo?: string
  bio?: string
  phone?: string
  role: string
}
