"use server"

import { HttpTypes } from "@medusajs/types"
import { PRODUCT_LIMIT } from "@/const"
import { listProducts } from "@/lib/data/products"
import { sortProducts } from "@/lib/helpers/sort-products"

type SortBy = "created_at" | "price_asc" | "price_desc"

type ListingSource = "search-index" | "store-api"

export type UnifiedProductListInput = {
  locale: string
  page?: number
  limit?: number
  query?: string
  sellerId?: string
  sellerHandle?: string
  categoryId?: string
  collectionId?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: SortBy
}

export type UnifiedProductListResult = {
  products: HttpTypes.StoreProduct[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  source: ListingSource
  diagnostics: {
    droppedByHydration: number
    droppedByCurrencyFilter: number
    droppedByPolicy: number
  }
}

const DEFAULT_DIAGNOSTICS = {
  droppedByHydration: 0,
  droppedByCurrencyFilter: 0,
  droppedByPolicy: 0,
}

const isSuspended = (product: HttpTypes.StoreProduct) =>
  ((product as any)?.seller?.store_status as string | undefined) === "SUSPENDED"

const getProductSellerIdentifiers = (product: HttpTypes.StoreProduct) => {
  const productAny = product as any

  return {
    id:
      (productAny?.seller?.id as string | undefined) ??
      (productAny?.seller?.seller_id as string | undefined) ??
      (productAny?.seller_id as string | undefined) ??
      (productAny?.metadata?.seller_id as string | undefined) ??
      "",
    handle:
      (productAny?.seller?.handle as string | undefined) ??
      (productAny?.metadata?.seller_handle as string | undefined) ??
      "",
  }
}

const applyPolicyFilters = (
  products: HttpTypes.StoreProduct[],
  input: UnifiedProductListInput
) => {
  const diagnostics = { ...DEFAULT_DIAGNOSTICS }

  const filtered = products.filter((product) => {
    if (isSuspended(product)) {
      diagnostics.droppedByPolicy += 1
      return false
    }

    if (input.sellerId) {
      const sellerId = getProductSellerIdentifiers(product).id
      if (sellerId !== input.sellerId) {
        diagnostics.droppedByPolicy += 1
        return false
      }
    }

    if (input.sellerHandle) {
      const sellerHandle = getProductSellerIdentifiers(product).handle
      if (sellerHandle !== input.sellerHandle) {
        diagnostics.droppedByPolicy += 1
        return false
      }
    }

    return true
  })

  return { products: filtered, diagnostics }
}

const getFromStoreApi = async (
  input: UnifiedProductListInput
): Promise<UnifiedProductListResult> => {
  const page = Math.max(1, input.page ?? 1)
  const limit = input.limit ?? PRODUCT_LIMIT
  const sortBy = input.sortBy ?? "created_at"

  const { response } = await listProducts({
    pageParam: page,
    countryCode: input.locale,
    category_id: input.categoryId,
    collection_id: input.collectionId,
    queryParams: {
      limit,
      q: input.query,
    } as HttpTypes.FindParams & HttpTypes.StoreProductParams,
  })

  const { products, diagnostics } = applyPolicyFilters(response.products, input)

  const sortedProducts =
    sortBy === "created_at" ? products : sortProducts(products, sortBy)

  const total = input.sellerId || input.sellerHandle ? sortedProducts.length : response.count
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return {
    products: sortedProducts,
    total,
    page,
    pageSize: limit,
    totalPages,
    source: "store-api",
    diagnostics,
  }
}

const getFromSearchIndex = async (
  _input: UnifiedProductListInput
): Promise<UnifiedProductListResult | null> => {
  // Search-index adapter placeholder:
  // keep deterministic fallback path while unifying route consumption.
  return null
}

export const listUnifiedProducts = async (
  input: UnifiedProductListInput
): Promise<UnifiedProductListResult> => {
  const primary =
    (process.env.NEXT_PUBLIC_STOREFRONT_LISTING_PRIMARY_SOURCE as ListingSource | undefined) ??
    "store-api"

  if (primary === "search-index") {
    const indexed = await getFromSearchIndex(input)
    if (indexed) {
      return indexed
    }
  }

  return getFromStoreApi(input)
}
