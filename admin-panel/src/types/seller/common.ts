export enum StoreStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}

export type SellerDTO = {
  id: string;
  store_status: StoreStatus;
  created_at: Date;
  updated_at: Date;
  name: string;
  email: string | null;
  phone: string | null;
  description: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country_code: string | null;
  tax_id: string | null;
  handle: string;
  photo: string | null;
  members?: Partial<MemberDTO>[];
};

export type SellerWithPayoutAccountDTO = SellerDTO & {
  payout_account: {
    id: string;
    created_at: Date;
    updated_at: Date;
    reference_id: string;
    data: Record<string, unknown>;
    status: string;
  };
};

export enum MemberRole {
  OWNER = "owner",
  ADMIN = "admin",
  MEMBER = "member",
}

export type MemberDTO = {
  id: string;
  created_at: Date;
  updated_at: Date;
  role: MemberRole;
  email: string | null;
  name: string | null;
  bio: string | null;
  photo: string | null;
  phone: string | null;
  seller?: Partial<SellerDTO>;
};

export type MemberInviteDTO = {
  id: string;
  created_at: Date;
  updated_at: Date;
  email: string;
  role: MemberRole;
  seller?: Partial<SellerDTO>;
  token: string;
  expires_at: Date;
  accepted: boolean;
};

export interface VendorSeller {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string | null;
  store_status: string;
  handle: string;
  email?: string | null;
  phone?: string | null;
  photo?: string | null;
  address_line?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country_code?: string | null;
  tax_id?: string | null;
  members?: VendorMember[];
  // Extended fields from backend links
  seller_metadata?: SellerMetadata | null;
  producer?: ProducerInfo | null;
}

export interface SellerMetadata {
  id: string;
  seller_id: string;
  vendor_type: string;
  business_registration_number?: string | null;
  tax_classification?: string | null;
  social_links?: Record<string, string> | null;
  storefront_links?: Record<string, string> | null;
  website_url?: string | null;
  farm_practices?: Record<string, any> | null;
  certifications?: Record<string, any>[] | null;
  growing_region?: string | null;
  cuisine_types?: string[] | null;
  service_types?: string[] | null;
  featured: boolean;
  verified: boolean;
  rating?: number | null;
  review_count?: number;
  enabled_extensions?: string[] | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface ProducerInfo {
  id: string;
  seller_id: string;
  name: string;
  handle: string;
  description?: string | null;
  region?: string | null;
  state?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  farm_size_acres?: number | null;
  year_established?: number | null;
  practices?: string[] | null;
  certifications?: any[] | null;
  story?: string | null;
  photo?: string | null;
  cover_image?: string | null;
  gallery?: string[] | null;
  website?: string | null;
  social_links?: Record<string, string> | null;
  public_profile_enabled: boolean;
  featured: boolean;
  verified: boolean;
  verified_at?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface VendorMember {
  id: string;
  created_at: string;
  updated_at: string;
  role: "owner" | "admin" | "member";
  email: string;
  name?: string | null;
  bio?: string | null;
  photo?: string | null;
}
