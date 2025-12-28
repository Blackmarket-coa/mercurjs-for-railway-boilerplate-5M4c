/**
 * Producer types for Admin Panel
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
  IPM = "IPM",
}

export const GrowingPracticeLabels: Record<GrowingPractice, string> = {
  [GrowingPractice.ORGANIC]: "Organic",
  [GrowingPractice.CERTIFIED_ORGANIC]: "Certified Organic",
  [GrowingPractice.REGENERATIVE]: "Regenerative",
  [GrowingPractice.CONVENTIONAL]: "Conventional",
  [GrowingPractice.BIODYNAMIC]: "Biodynamic",
  [GrowingPractice.PERMACULTURE]: "Permaculture",
  [GrowingPractice.HYDROPONIC]: "Hydroponic",
  [GrowingPractice.AQUAPONIC]: "Aquaponic",
  [GrowingPractice.NO_SPRAY]: "No Spray",
  [GrowingPractice.IPM]: "Integrated Pest Management",
}

export interface Certification {
  name: string
  issuer: string
  valid_until?: string
  document_url?: string
  verified?: boolean
}

export interface SocialLinks {
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  tiktok?: string
  website?: string
}

export interface Producer {
  id: string
  seller_id: string
  name: string
  handle: string
  description?: string
  region?: string
  state?: string
  country_code?: string
  latitude?: number
  longitude?: number
  farm_size_acres?: number
  year_established?: number
  practices?: GrowingPractice[]
  certifications?: Certification[]
  story?: string
  photo?: string
  cover_image?: string
  gallery?: string[]
  website?: string
  social_links?: SocialLinks
  public_profile_enabled: boolean
  featured: boolean
  verified: boolean
  verified_at?: string
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  // Joined relations
  seller?: {
    id: string
    name: string
    email: string
    store_status: string
  }
}

export interface AdminProducerListResponse {
  producers: Producer[]
  count: number
  offset: number
  limit: number
}

export interface AdminProducerResponse {
  producer: Producer
}

export interface AdminProducerStatsResponse {
  stats: {
    total_producers: number
    verified_producers: number
    pending_verification: number
    featured_producers: number
    producers_by_region: { region: string; count: number }[]
    producers_by_practice: { practice: string; count: number }[]
  }
}

export type ProducerListParams = {
  q?: string
  limit?: number
  offset?: number
  order?: string
  verified?: boolean
  featured?: boolean
  region?: string
  fields?: string
}

export type UpdateProducerInput = {
  name?: string
  handle?: string
  description?: string
  region?: string
  state?: string
  country_code?: string
  farm_size_acres?: number
  year_established?: number
  practices?: GrowingPractice[]
  certifications?: Certification[]
  story?: string
  photo?: string
  cover_image?: string
  gallery?: string[]
  website?: string
  social_links?: SocialLinks
  public_profile_enabled?: boolean
  featured?: boolean
  verified?: boolean
  metadata?: Record<string, unknown>
}
