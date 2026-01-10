import { VendorType, VendorFeatures } from "../../../providers/vendor-type-provider"

/**
 * Quick action item for type-specific dashboards
 */
export interface QuickAction {
  icon: React.ReactNode
  label: string
  to: string
  description?: string
  color?: string
}

/**
 * Metric card for dashboard
 */
export interface DashboardMetric {
  label: string
  value: string | number
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
}

/**
 * Get dashboard title based on vendor type
 */
export function getDashboardTitle(type: VendorType): string {
  const titles: Record<VendorType, string> = {
    producer: "Farm Dashboard",
    garden: "Garden Dashboard",
    maker: "Maker Dashboard",
    restaurant: "Restaurant Dashboard",
    mutual_aid: "Community Dashboard",
    default: "Vendor Dashboard",
  }
  return titles[type]
}

/**
 * Get welcome message based on vendor type
 */
export function getWelcomeMessage(type: VendorType): string {
  const messages: Record<VendorType, string> = {
    producer: "Manage your farm products, orders, and connect with local customers.",
    garden: "Organize your garden plots, volunteers, and harvest shares.",
    maker: "Showcase your creations, manage orders, and grow your craft business.",
    restaurant: "Handle orders, manage your menu, and delight customers.",
    mutual_aid: "Coordinate resources, volunteers, and community support.",
    default: "Manage your store, products, and orders.",
  }
  return messages[type]
}

/**
 * Get primary CTA label based on vendor type
 */
export function getPrimaryCTALabel(type: VendorType): string {
  const labels: Record<VendorType, string> = {
    producer: "Add New Product",
    garden: "Post Harvest",
    maker: "Add Creation",
    restaurant: "Add Menu Item",
    mutual_aid: "Add Resource",
    default: "Add Product",
  }
  return labels[type]
}

/**
 * Get primary CTA route based on vendor type
 */
export function getPrimaryCTARoute(type: VendorType): string {
  const routes: Record<VendorType, string> = {
    producer: "/products/create",
    garden: "/products/create",
    maker: "/products/create",
    restaurant: "/menu/items/create",
    mutual_aid: "/inventory/create",
    default: "/products/create",
  }
  return routes[type]
}

/**
 * Get onboarding steps based on vendor type
 */
export function getOnboardingSteps(type: VendorType, features: VendorFeatures) {
  const baseSteps = [
    {
      key: "store_information",
      title: "Complete your profile",
      description: type === "producer" 
        ? "Add your farm story, location, and practices"
        : type === "garden"
        ? "Add your garden's mission and location"
        : type === "restaurant"
        ? "Add your restaurant details and cuisine"
        : "Complete your store information",
      to: "/settings/store-detail",
      icon: "Building",
    },
    {
      key: "locations_shipping",
      title: features.hasDeliveryZones ? "Set up delivery zones" : "Set up shipping",
      description: features.hasDeliveryZones
        ? "Define where you deliver or provide services"
        : "Configure shipping options and pickup locations",
      to: "/settings/locations",
      icon: "MapPin",
    },
  ]

  // Type-specific product step
  if (features.hasProducts) {
    baseSteps.push({
      key: "products",
      title: type === "producer" 
        ? "Add your first product"
        : type === "garden"
        ? "Post your first harvest"
        : type === "maker"
        ? "Add your first creation"
        : "Add your first product",
      description: "Get started by adding items to your store",
      to: "/products/create",
      icon: "Tag",
    })
  }

  if (features.hasMenu) {
    baseSteps.push({
      key: "menu",
      title: "Create your menu",
      description: "Add menu items and categories",
      to: "/menu/items/create",
      icon: "Newspaper",
    })
  }

  if (features.hasPlots) {
    baseSteps.push({
      key: "plots",
      title: "Set up your plots",
      description: "Define available garden plots for your community",
      to: "/plots",
      icon: "SquaresPlus",
    })
  }

  if (features.hasVolunteers) {
    baseSteps.push({
      key: "volunteers",
      title: "Set up volunteer management",
      description: "Configure volunteer roles and schedules",
      to: "/volunteers",
      icon: "Heart",
    })
  }

  return baseSteps
}

/**
 * Get beginner tips based on vendor type
 */
export function getBeginnerTips(type: VendorType): Array<{
  title: string
  description: string
}> {
  const tipsByType: Record<VendorType, Array<{ title: string; description: string }>> = {
    producer: [
      {
        title: "Share your story",
        description: "Customers love knowing where their food comes from. Share your farming practices and values.",
      },
      {
        title: "High-quality photos sell",
        description: "Show your products in natural settings. Fresh produce photos get 3x more engagement.",
      },
      {
        title: "Seasonal offerings",
        description: "Update your inventory regularly with what's fresh and in season.",
      },
    ],
    garden: [
      {
        title: "Build community",
        description: "Host events and workdays to engage members and grow your volunteer base.",
      },
      {
        title: "Share harvest updates",
        description: "Post regular updates about what's growing and available for harvest.",
      },
      {
        title: "Recognize volunteers",
        description: "Thank your volunteers publicly. Recognition keeps people coming back.",
      },
    ],
    maker: [
      {
        title: "Tell your craft story",
        description: "Share the process behind your creations. Handmade authenticity drives sales.",
      },
      {
        title: "Quality photography",
        description: "Show your products from multiple angles with good lighting.",
      },
      {
        title: "Limited editions work",
        description: "Create urgency with limited batch releases and seasonal collections.",
      },
    ],
    restaurant: [
      {
        title: "Appetizing photos",
        description: "Invest in good food photography. It's the #1 factor in online food orders.",
      },
      {
        title: "Keep menu updated",
        description: "Mark items unavailable promptly and highlight daily specials.",
      },
      {
        title: "Respond quickly",
        description: "Fast responses to orders build customer loyalty and reviews.",
      },
    ],
    mutual_aid: [
      {
        title: "Clear communication",
        description: "Be specific about what resources are available and how to access them.",
      },
      {
        title: "Coordinate volunteers",
        description: "Well-organized volunteer schedules maximize your impact.",
      },
      {
        title: "Share impact stories",
        description: "Document your community impact to inspire more support.",
      },
    ],
    default: [
      {
        title: "High-quality photos sell",
        description: "Products with clear photos get 3x more views. Use natural lighting.",
      },
      {
        title: "Price competitively",
        description: "Research similar products. Competitive pricing helps you get discovered.",
      },
      {
        title: "Respond quickly",
        description: "Fast response times lead to higher conversion rates.",
      },
    ],
  }
  
  return tipsByType[type]
}
