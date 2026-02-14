import { HttpTypes } from "@medusajs/types"
import {
  ExtendedAdminProductVariant,
  ProductStockGridRow,
} from "../../../types/products"

type InventoryStrategy =
  | "STANDARD"
  | "LOT_BASED"
  | "UNLIMITED"
  | "CAPACITY"
  | "NONE"

const TRACKABLE_STRATEGIES: InventoryStrategy[] = ["STANDARD", "LOT_BASED"]

const resolveInventoryStrategy = (
  variant: ExtendedAdminProductVariant
): InventoryStrategy | undefined => {
  const metadata = variant.metadata as
    | Record<string, unknown>
    | null
    | undefined
  const strategy = metadata?.inventory_strategy

  if (typeof strategy !== "string") {
    return undefined
  }

  const upper = strategy.toUpperCase() as InventoryStrategy

  if (
    ["STANDARD", "LOT_BASED", "UNLIMITED", "CAPACITY", "NONE"].includes(upper)
  ) {
    return upper
  }

  return undefined
}

const isStrategyTrackable = (variant: ExtendedAdminProductVariant): boolean => {
  const strategy = resolveInventoryStrategy(variant)

  if (!strategy) {
    return true
  }

  return TRACKABLE_STRATEGIES.includes(strategy)
}

export function isProductVariant(
  row: ProductStockGridRow
): row is ExtendedAdminProductVariant {
  return row.id.startsWith("variant_")
}

export function isProductVariantWithInventoryPivot(
  row: ProductStockGridRow
): row is ExtendedAdminProductVariant & {
  inventory_items: HttpTypes.AdminProductVariantInventoryItemLink[]
} {
  return (
    "inventory_items" in row &&
    Array.isArray(row.inventory_items) &&
    row.inventory_items.length > 0
  )
}

export function getDisabledInventoryRows(
  variants: ExtendedAdminProductVariant[]
) {
  const seen: Record<string, ExtendedAdminProductVariant> = {}
  const disabled: Record<string, { id: string; title: string; sku: string }> =
    {}

  variants?.forEach((variant) => {
    const inventoryItems = variant.inventory_items

    if (!inventoryItems) {
      return
    }

    if (!isStrategyTrackable(variant)) {
      inventoryItems.forEach((item) => {
        disabled[item.inventory_item_id] = {
          id: variant.id,
          title: variant.title || "",
          sku: variant.sku || "",
        }
      })

      return
    }

    inventoryItems.forEach((item) => {
      const existing = seen[item.inventory_item_id]

      if (existing) {
        disabled[item.inventory_item_id] = {
          id: existing.id,
          title: existing.title || "",
          sku: existing.sku || "",
        }

        return
      }

      seen[item.inventory_item_id] = variant
    })
  })

  return disabled
}
