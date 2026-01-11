import { createContext, useContext, ReactNode, useMemo } from "react"
import { useMe } from "../../hooks/api/users"

/**
 * Vendor Types supported by the platform
 */
export type VendorType =
  | "producer"      // Farms, food producers
  | "garden"        // Community gardens
  | "kitchen"       // Commercial community kitchens
  | "maker"         // Artisans, crafters
  | "restaurant"    // Restaurants, ghost kitchens
  | "mutual_aid"    // Mutual aid networks
  | "default"       // Fallback

/**
 * Feature flags based on vendor type
 */
export interface VendorFeatures {
  hasProducts: boolean
  hasInventory: boolean
  hasSeasons: boolean
  hasVolunteers: boolean
  hasMenu: boolean
  hasDeliveryZones: boolean
  hasDonations: boolean
  hasSubscriptions: boolean
  hasSupport: boolean
  hasHarvests: boolean
  hasPlots: boolean
  hasRequests: boolean
}

/**
 * Context value type
 */
type VendorTypeContextValue = {
  vendorType: VendorType
  isLoading: boolean
  features: VendorFeatures
  typeLabel: string
  typeLabelPlural: string
}

const VendorTypeContext = createContext<VendorTypeContextValue | null>(null)

/**
 * Get feature flags for a specific vendor type
 */
function getFeaturesByType(type: VendorType): VendorFeatures {
  const featureMap: Record<VendorType, VendorFeatures> = {
    producer: {
      hasProducts: true,
      hasInventory: true,
      hasSeasons: true,
      hasVolunteers: false,
      hasMenu: false,
      hasDeliveryZones: false,
      hasDonations: false,
      hasSubscriptions: true,
      hasSupport: true,
      hasHarvests: true,
      hasPlots: false,
      hasRequests: false,
    },
    garden: {
      hasProducts: true,  // Harvest shares, seedlings
      hasInventory: false,
      hasSeasons: true,
      hasVolunteers: true,
      hasMenu: false,
      hasDeliveryZones: false,
      hasDonations: true,
      hasSubscriptions: true,  // Seasonal shares
      hasSupport: true,
      hasHarvests: true,
      hasPlots: true,
      hasRequests: false,
    },
    kitchen: {
      hasProducts: true,  // Prepared foods, catering items
      hasInventory: true,  // Kitchen supplies, ingredients
      hasSeasons: false,
      hasVolunteers: true,
      hasMenu: true,  // Food preparation capabilities
      hasDeliveryZones: true,  // Service areas
      hasDonations: true,
      hasSubscriptions: true,  // Recurring kitchen time
      hasSupport: true,
      hasHarvests: false,
      hasPlots: false,
      hasRequests: true,  // Kitchen time requests
    },
    maker: {
      hasProducts: true,
      hasInventory: true,
      hasSeasons: false,
      hasVolunteers: false,
      hasMenu: false,
      hasDeliveryZones: false,
      hasDonations: false,
      hasSubscriptions: false,
      hasSupport: true,
      hasHarvests: false,
      hasPlots: false,
      hasRequests: false,
    },
    restaurant: {
      hasProducts: false,  // Uses menu items instead
      hasInventory: false,
      hasSeasons: false,
      hasVolunteers: false,
      hasMenu: true,
      hasDeliveryZones: true,
      hasDonations: false,
      hasSubscriptions: false,
      hasSupport: false,
      hasHarvests: false,
      hasPlots: false,
      hasRequests: false,
    },
    mutual_aid: {
      hasProducts: false,
      hasInventory: true,  // Resource inventory
      hasSeasons: false,
      hasVolunteers: true,
      hasMenu: false,
      hasDeliveryZones: true,  // Service areas
      hasDonations: true,
      hasSubscriptions: false,
      hasSupport: false,
      hasHarvests: false,
      hasPlots: false,
      hasRequests: true,
    },
    default: {
      hasProducts: true,
      hasInventory: true,
      hasSeasons: false,
      hasVolunteers: false,
      hasMenu: false,
      hasDeliveryZones: false,
      hasDonations: false,
      hasSubscriptions: false,
      hasSupport: false,
      hasHarvests: false,
      hasPlots: false,
      hasRequests: false,
    },
  }
  
  return featureMap[type]
}

/**
 * Get human-readable labels for vendor types
 */
function getTypeLabels(type: VendorType): { label: string; plural: string } {
  const labels: Record<VendorType, { label: string; plural: string }> = {
    producer: { label: "Producer", plural: "Producers" },
    garden: { label: "Community Garden", plural: "Community Gardens" },
    kitchen: { label: "Community Kitchen", plural: "Community Kitchens" },
    maker: { label: "Maker", plural: "Makers" },
    restaurant: { label: "Restaurant", plural: "Restaurants" },
    mutual_aid: { label: "Mutual Aid Network", plural: "Mutual Aid Networks" },
    default: { label: "Vendor", plural: "Vendors" },
  }
  return labels[type]
}

/**
 * Provider component that wraps the app and provides vendor type context
 */
export function VendorTypeProvider({ children }: { children: ReactNode }) {
  const { seller, isPending } = useMe()
  
  // Get vendor type from seller or default
  const vendorType: VendorType = useMemo(() => {
    const type = seller?.vendor_type as VendorType
    if (type && ["producer", "garden", "kitchen", "maker", "restaurant", "mutual_aid"].includes(type)) {
      return type
    }
    return "default"
  }, [seller?.vendor_type])
  
  // Memoize features and labels
  const features = useMemo(() => getFeaturesByType(vendorType), [vendorType])
  const { label: typeLabel, plural: typeLabelPlural } = useMemo(
    () => getTypeLabels(vendorType), 
    [vendorType]
  )
  
  const value: VendorTypeContextValue = {
    vendorType,
    isLoading: isPending,
    features,
    typeLabel,
    typeLabelPlural,
  }
  
  return (
    <VendorTypeContext.Provider value={value}>
      {children}
    </VendorTypeContext.Provider>
  )
}

/**
 * Hook to access vendor type context
 */
export function useVendorType() {
  const context = useContext(VendorTypeContext)
  if (!context) {
    throw new Error("useVendorType must be used within VendorTypeProvider")
  }
  return context
}

/**
 * Hook for conditional rendering based on vendor type
 */
export function useIsVendorType(...types: VendorType[]) {
  const { vendorType } = useVendorType()
  return types.includes(vendorType)
}
