import {
  Buildings,
  ChevronDownMini,
  CogSixTooth,
  CurrencyDollar,
  MagnifyingGlass,
  MinusMini,
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
} from "@medusajs/icons"
import { Badge, Divider, Text, clx } from "@medusajs/ui"
import { Collapsible as RadixCollapsible } from "radix-ui"
import { useTranslation } from "react-i18next"

import { Skeleton } from "../../common/skeleton"
import { INavItem, NavItem } from "../../layout/nav-item"
import { Shell } from "../../layout/shell"

import { useLocation } from "react-router-dom"
import { useMe } from "../../../hooks/api"
import { useVendorNavigation, NavItemConfig } from "../../../hooks/navigation"

import { useSearch } from "../../../providers/search-provider"
import { UserMenu } from "../user-menu"
import { StripeIcon } from "../../../assets/icons/Stripe"
import { ImageAvatar } from "../../common/image-avatar"
import { useRocketChat } from "../../../providers/rocketchat-provider"
import { useVendorType } from "../../../providers/vendor-type-provider"

export const MainLayout = () => {
  return (
    <Shell>
      <MainSidebar />
    </Shell>
  )
}

const MainSidebar = () => {
  return (
    <aside className="flex flex-1 flex-col justify-between overflow-y-auto">
      <div className="flex flex-1 flex-col">
        <div className="bg-ui-bg-subtle sticky top-0">
          <Header />
          <div className="px-3">
            <Divider variant="dashed" />
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex flex-1 flex-col">
            <CoreRouteSection />
            <ExtensionRouteSection />
          </div>
          <UtilitySection />
        </div>
        <div className="bg-ui-bg-subtle sticky bottom-0">
          <UserSection />
        </div>
      </div>
    </aside>
  )
}

const Header = () => {
  const { seller } = useMe()
  const { vendorType, typeLabel } = useVendorType()

  const name = seller?.name || ""
  const fallback = seller?.photo || "M"

  // Get badge color based on vendor type
  const getBadgeColor = () => {
    switch (vendorType) {
      case "producer": return "green"
      case "garden": return "blue"
      case "maker": return "orange"
      case "restaurant": return "purple"
      case "mutual_aid": return "red"
      default: return "grey"
    }
  }

  return (
    <div className="w-full p-3 p-0.5 pr-2 bg-ui-bg-subtle">
      <div className="grid w-full grid-cols-[24px_1fr_15px] items-center gap-x-3">
        {fallback ? (
          <div className="w-7 h-7">
            <ImageAvatar src={seller?.photo || "/Logo.svg"} size={7} rounded />
          </div>
        ) : (
          <Skeleton className="h-6 w-6 rounded-md" />
        )}
        <div className="block overflow-hidden text-left">
          {name ? (
            <Text
              size="small"
              weight="plus"
              leading="compact"
              className="truncate"
            >
              {name}
            </Text>
          ) : (
            <Skeleton className="h-[9px] w-[120px]" />
          )}
        </div>
      </div>
      {/* Vendor type badge */}
      {vendorType !== "default" && (
        <div className="mt-2">
          <Badge color={getBadgeColor()} size="xsmall">
            {typeLabel}
          </Badge>
        </div>
      )}
    </div>
  )
}

const Searchbar = () => {
  const { t } = useTranslation()
  const { toggleSearch } = useSearch()

  return (
    <div className="px-3">
      <button
        onClick={toggleSearch}
        className={clx(
          "bg-ui-bg-subtle text-ui-fg-subtle flex w-full items-center gap-x-2.5 rounded-md px-2 py-1 outline-none",
          "hover:bg-ui-bg-subtle-hover",
          "focus-visible:shadow-borders-focus"
        )}
      >
        <MagnifyingGlass />
        <div className="flex-1 text-left">
          <Text size="small" leading="compact" weight="plus">
            {t("app.search.label")}
          </Text>
        </div>
        <Text size="small" leading="compact" className="text-ui-fg-muted">
          ⌘K
        </Text>
      </button>
    </div>
  )
}

const CoreRouteSection = () => {
  const { coreRoutes } = useVendorNavigation()

  return (
    <nav className="flex flex-col gap-y-1 py-3">
      <Searchbar />
      {coreRoutes.map((route) => {
        return <NavItem key={route.to} {...route} />
      })}
    </nav>
  )
}

const ExtensionRouteSection = () => {
  const { extensionRoutes } = useVendorNavigation()
  const { t } = useTranslation()

  if (!extensionRoutes.length) return null

  return (
    <div>
      <div className="px-3">
        <Divider variant="dashed" />
      </div>
      <div className="flex flex-col gap-y-1 py-3">
        <RadixCollapsible.Root defaultOpen>
          <div className="px-4">
            <RadixCollapsible.Trigger asChild className="group/trigger">
              <button className="text-ui-fg-subtle flex w-full items-center justify-between px-2">
                <Text size="xsmall" weight="plus" leading="compact">
                  {t("app.nav.common.extensions")}
                </Text>
                <div className="text-ui-fg-muted">
                  <ChevronDownMini className="group-data-[state=open]/trigger:hidden" />
                  <MinusMini className="group-data-[state=closed]/trigger:hidden" />
                </div>
              </button>
            </RadixCollapsible.Trigger>
          </div>
          <RadixCollapsible.Content>
            <nav className="flex flex-col gap-y-0.5 py-1 pb-4">
              {extensionRoutes.map((route) => {
                return <NavItem key={route.to} {...route} />
              })}
            </nav>
          </RadixCollapsible.Content>
        </RadixCollapsible.Root>
      </div>
    </div>
  )
}

const UtilitySection = () => {
  const location = useLocation()
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-y-0.5 py-3">
      <NavItem
        label={t("app.nav.settings.header")}
        to="/settings"
        from={location.pathname}
        icon={<CogSixTooth />}
      />
    </div>
  )
}

const UserSection = () => {
  return (
    <div>
      <div className="px-3">
        <Divider variant="dashed" />
      </div>
      <UserMenu />
    </div>
  )
}

