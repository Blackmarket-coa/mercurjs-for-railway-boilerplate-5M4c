import {
  Buildings,
  CogSixTooth,
  CurrencyDollar,
  ReceiptPercent,
  ShoppingCart,
  Tag,
  Users,
  Component,
  Star,
  ListCheckbox,
  ChatBubbleLeftRight,
  CalendarMini,
  CashSolid,
  Gift,
  Heart,
  Newspaper,
  SquaresPlus,
} from "@medusajs/icons"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { useVendorType, VendorType, VendorFeatures } from "../../providers/vendor-type-provider"
import { useRocketChat } from "../../providers/rocketchat-provider"
import { StripeIcon } from "../../assets/icons/Stripe"

/**
 * Navigation Item Interface
 */
export interface NavItemConfig {
  icon: ReactNode
  label: string
  to: string
  items?: { label: string; to: string }[]
  // Feature flags for conditional display
  showFor?: (features: VendorFeatures, type: VendorType) => boolean
  // Override labels per vendor type
  labelByType?: Partial<Record<VendorType, string>>
}

/**
 * Get type-specific label or default
 */
function getTypeLabel(item: NavItemConfig, vendorType: VendorType): string {
  if (item.labelByType && item.labelByType[vendorType]) {
    return item.labelByType[vendorType]!
  }
  return item.label
}

/**
 * Custom hook that returns navigation routes filtered by vendor type
 */
export function useVendorNavigation() {
  const { t } = useTranslation()
  const { vendorType, features } = useVendorType()
  const { unreadCount } = useRocketChat()

  /**
   * Core navigation routes with conditional visibility
   */
  const coreRoutes: NavItemConfig[] = [
    {
      icon: <Component />,
      label: "Dashboard",
      to: "/dashboard",
      // Always visible
    },
    {
      icon: <CashSolid />,
      label: "Finances",
      to: "/finances",
      labelByType: {
        mutual_aid: "Donations",
        garden: "Funds",
      },
      // Always visible
    },
    {
      icon: <ShoppingCart />,
      label: t("orders.domain"),
      to: "/orders",
      labelByType: {
        garden: "Harvest Orders",
        restaurant: "Food Orders",
        mutual_aid: "Requests",
      },
      // Always visible
    },
    {
      icon: <Tag />,
      label: t("products.domain"),
      to: "/products",
      showFor: (f) => f.hasProducts,
      labelByType: {
        garden: "Harvests",
        producer: "Products",
        maker: "Creations",
      },
      items: [
        {
          label: t("collections.domain"),
          to: "/collections",
        },
        {
          label: t("categories.domain"),
          to: "/categories",
        },
      ],
    },
    // Menu items for restaurants
    {
      icon: <Newspaper />,
      label: "Menu",
      to: "/menu",
      showFor: (f) => f.hasMenu,
      items: [
        {
          label: "Menu Items",
          to: "/menu/items",
        },
        {
          label: "Menu Categories",
          to: "/menu/categories",
        },
      ],
    },
    // Garden plots
    {
      icon: <SquaresPlus />,
      label: "Plots",
      to: "/plots",
      showFor: (f) => f.hasPlots,
      items: [
        {
          label: "Available Plots",
          to: "/plots/available",
        },
        {
          label: "Plot Assignments",
          to: "/plots/assignments",
        },
      ],
    },
    // Volunteers for gardens and mutual aid
    {
      icon: <Heart />,
      label: "Volunteers",
      to: "/volunteers",
      showFor: (f) => f.hasVolunteers,
      items: [
        {
          label: "Volunteer List",
          to: "/volunteers/list",
        },
        {
          label: "Schedule",
          to: "/volunteers/schedule",
        },
      ],
    },
    // Donations for gardens and mutual aid
    {
      icon: <Gift />,
      label: "Donations",
      to: "/donations",
      showFor: (f) => f.hasDonations,
    },
    // Order Cycles (for subscriptions)
    {
      icon: <CalendarMini />,
      label: "Order Cycles",
      to: "/order-cycles",
      showFor: (f) => f.hasSubscriptions,
      labelByType: {
        garden: "Harvest Cycles",
        producer: "Season Cycles",
      },
    },
    // Inventory
    {
      icon: <Buildings />,
      label: t("inventory.domain"),
      to: "/inventory",
      showFor: (f) => f.hasInventory,
      labelByType: {
        mutual_aid: "Resources",
      },
      items: [
        {
          label: t("reservations.domain"),
          to: "/reservations",
        },
      ],
    },
    // Delivery zones for restaurants and mutual aid
    {
      icon: <Buildings />,
      label: "Delivery Zones",
      to: "/delivery-zones",
      showFor: (f) => f.hasDeliveryZones,
      labelByType: {
        mutual_aid: "Service Areas",
      },
    },
    // Customers
    {
      icon: <Users />,
      label: t("customers.domain"),
      to: "/customers",
      labelByType: {
        garden: "Members",
        mutual_aid: "Community",
      },
      items: [
        {
          label: t("customerGroups.domain"),
          to: "/customer-groups",
        },
      ],
    },
    // Promotions
    {
      icon: <ReceiptPercent />,
      label: t("promotions.domain"),
      to: "/promotions",
      showFor: (f) => f.hasProducts || f.hasMenu,
      items: [
        {
          label: t("campaigns.domain"),
          to: "/campaigns",
        },
      ],
    },
    // Price Lists
    {
      icon: <CurrencyDollar />,
      label: t("priceLists.domain"),
      to: "/price-lists",
      showFor: (f) => f.hasProducts,
    },
    // Reviews
    {
      icon: <Star />,
      label: "Reviews",
      to: "/reviews",
      showFor: (f) => f.hasProducts || f.hasMenu,
    },
    // Messages
    {
      icon: <ChatBubbleLeftRight />,
      label: `Messages ${unreadCount > 0 ? `(${unreadCount})` : ""}`,
      to: "/messages",
      // Always visible
    },
    // Requests
    {
      icon: <ListCheckbox />,
      label: "Requests",
      to: "/requests",
      showFor: (f) => f.hasRequests || f.hasProducts,
      labelByType: {
        mutual_aid: "Support Requests",
      },
      items: [
        {
          label: "Collections",
          to: "/requests/collections",
        },
        {
          label: "Categories",
          to: "/requests/categories",
        },
        {
          label: "Reviews",
          to: "/requests/reviews",
        },
      ],
    },
  ]

  /**
   * Extension routes (integrations)
   */
  const extensionRoutes: NavItemConfig[] = [
    {
      icon: <StripeIcon />,
      label: "Stripe Connect",
      to: "/stripe-connect",
    },
    {
      icon: <Buildings />,
      label: "Venues",
      to: "/venues",
      showFor: (_, type) => type === "restaurant",
    },
  ]

  /**
   * Filter routes based on vendor type and features
   */
  function filterRoutes(routes: NavItemConfig[]): NavItemConfig[] {
    return routes.filter((route) => {
      // If no showFor function, always show
      if (!route.showFor) return true
      // Otherwise, check if should show
      return route.showFor(features, vendorType)
    })
  }

  /**
   * Get routes with type-specific labels
   */
  function getRoutesWithLabels(routes: NavItemConfig[]): NavItemConfig[] {
    return routes.map((route) => ({
      ...route,
      label: getTypeLabel(route, vendorType),
    }))
  }

  // Return filtered and labeled routes
  return {
    coreRoutes: getRoutesWithLabels(filterRoutes(coreRoutes)),
    extensionRoutes: getRoutesWithLabels(filterRoutes(extensionRoutes)),
    vendorType,
    features,
  }
}

/**
 * Settings routes are mostly universal
 */
export function useSettingsNavigation() {
  const { t } = useTranslation()
  const { vendorType, features } = useVendorType()

  const settingsRoutes: NavItemConfig[] = [
    {
      icon: <CogSixTooth />,
      label: t("app.nav.settings.header"),
      to: "/settings",
    },
  ]

  return {
    settingsRoutes,
    vendorType,
    features,
  }
}
