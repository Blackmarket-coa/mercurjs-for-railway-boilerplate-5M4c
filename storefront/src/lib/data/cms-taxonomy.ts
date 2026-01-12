import { sdk } from "@/lib/config"

export interface CmsType {
  id: string
  handle: string
  name: string
  description: string | null
  icon: string | null
  display_order: number
  is_active: boolean
  categories?: CmsCategory[]
}

export interface CmsCategory {
  id: string
  type_id: string
  handle: string
  name: string
  description: string | null
  icon: string | null
  image_url: string | null
  display_order: number
  is_active: boolean
  tags?: CmsTag[]
  attributes?: CmsAttribute[]
}

export interface CmsTag {
  id: string
  handle: string
  name: string
  tag_type: string
  icon: string | null
  color: string | null
  is_active: boolean
}

export interface CmsAttribute {
  id: string
  handle: string
  name: string
  description: string | null
  input_type: string
  display_type: string
  unit: string | null
  is_filterable: boolean
  is_required: boolean
}

export interface CmsTaxonomy {
  taxonomy: CmsType[]
  total_types: number
  total_categories: number
}

/**
 * Fetch the complete CMS taxonomy for navigation
 * Returns all types with their categories
 */
export async function getCmsTaxonomy(): Promise<CmsTaxonomy> {
  try {
    const response = await sdk.client.fetch<CmsTaxonomy>(
      "/store/cms-taxonomy",
      {
        cache: "force-cache",
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )
    return response
  } catch (error) {
    console.error("Failed to fetch CMS taxonomy:", error)
    // Return empty taxonomy on error
    return {
      taxonomy: [],
      total_types: 0,
      total_categories: 0,
    }
  }
}

/**
 * Fetch all CMS types
 */
export async function getCmsTypes(): Promise<CmsType[]> {
  try {
    const response = await sdk.client.fetch<{ types: CmsType[] }>(
      "/store/cms-types",
      {
        cache: "force-cache",
        next: { revalidate: 3600 },
      }
    )
    return response.types || []
  } catch (error) {
    console.error("Failed to fetch CMS types:", error)
    return []
  }
}

/**
 * Fetch a single type with its categories
 */
export async function getCmsTypeByHandle(handle: string): Promise<CmsType | null> {
  try {
    const response = await sdk.client.fetch<{ type: CmsType }>(
      `/store/cms-types/${handle}`,
      {
        cache: "force-cache",
        next: { revalidate: 300 }, // 5 minute cache
      }
    )
    return response.type || null
  } catch (error) {
    console.error(`Failed to fetch CMS type ${handle}:`, error)
    return null
  }
}

/**
 * Fetch a category with its tags and attributes
 */
export async function getCmsCategoryByHandle(handle: string): Promise<CmsCategory | null> {
  try {
    const response = await sdk.client.fetch<{ category: CmsCategory }>(
      `/store/cms-categories/${handle}`,
      {
        cache: "force-cache",
        next: { revalidate: 300 },
      }
    )
    return response.category || null
  } catch (error) {
    console.error(`Failed to fetch CMS category ${handle}:`, error)
    return null
  }
}

/**
 * Fetch tags, optionally filtered by type or category
 */
export async function getCmsTags(options?: {
  tag_type?: string
  category_id?: string
}): Promise<CmsTag[]> {
  try {
    const queryParams = new URLSearchParams()
    if (options?.tag_type) queryParams.set("tag_type", options.tag_type)
    if (options?.category_id) queryParams.set("category_id", options.category_id)

    const url = `/store/cms-tags${queryParams.toString() ? `?${queryParams.toString()}` : ""}`

    const response = await sdk.client.fetch<{ tags: CmsTag[] }>(url, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    })
    return response.tags || []
  } catch (error) {
    console.error("Failed to fetch CMS tags:", error)
    return []
  }
}

// Icon mapping for CMS types (emoji to Lucide icon name mapping)
export const TYPE_ICONS: Record<string, string> = {
  "food-produce": "🥬",
  "prepared-foods-meals": "🍽️",
  "supplies-goods": "📦",
  "services-delivery": "🚚",
  "organizations-partnerships": "🤝",
  "equipment-tools": "🔧",
}

// Fallback categories for when CMS is not available
export const FALLBACK_TYPES: CmsType[] = [
  {
    id: "type_food_produce",
    handle: "food-produce",
    name: "Food & Produce",
    description: "Fresh fruits, vegetables, grains, meat, dairy, and beverages",
    icon: "🥬",
    display_order: 1,
    is_active: true,
    categories: [],
  },
  {
    id: "type_prepared_foods",
    handle: "prepared-foods-meals",
    name: "Prepared Foods",
    description: "Ready-to-eat meals, snacks, and beverages",
    icon: "🍽️",
    display_order: 2,
    is_active: true,
    categories: [],
  },
  {
    id: "type_supplies_goods",
    handle: "supplies-goods",
    name: "Supplies & Goods",
    description: "Household items, personal care, and pantry staples",
    icon: "📦",
    display_order: 3,
    is_active: true,
    categories: [],
  },
  {
    id: "type_services_delivery",
    handle: "services-delivery",
    name: "Services",
    description: "Delivery, catering, and logistics",
    icon: "🚚",
    display_order: 4,
    is_active: true,
    categories: [],
  },
  {
    id: "type_organizations",
    handle: "organizations-partnerships",
    name: "Organizations",
    description: "Food banks, mutual aid, community gardens, and kitchens",
    icon: "🤝",
    display_order: 5,
    is_active: true,
    categories: [],
  },
  {
    id: "type_equipment_tools",
    handle: "equipment-tools",
    name: "Equipment",
    description: "Kitchen equipment, gardening tools, and machinery",
    icon: "🔧",
    display_order: 6,
    is_active: true,
    categories: [],
  },
]
