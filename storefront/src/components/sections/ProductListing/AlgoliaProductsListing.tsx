"use client"

import { HttpTypes } from "@medusajs/types"
import {
  AlgoliaProductSidebar,
  ProductCard,
  ProductListingActiveFilters,
  ProductsPagination,
} from "@/components/organisms"
import { client } from "@/lib/client"
import { Configure, useHits } from "react-instantsearch"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { useSearchParams } from "next/navigation"
import { getFacedFilters } from "@/lib/helpers/get-faced-filters"
import { PRODUCT_LIMIT } from "@/const"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { useEffect, useMemo, useState } from "react"
import { listProducts } from "@/lib/data/products"

export const AlgoliaProductsListing = ({
  category_id,
  collection_id,
  seller_handle,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION,
  currency_code,
}: {
  category_id?: string
  collection_id?: string
  locale?: string
  seller_handle?: string
  currency_code: string
}) => {
  const searchParamas = useSearchParams()

  const facetFilters: string = getFacedFilters(searchParamas)
  const query: string = searchParamas.get("query") || ""
  const page: number = +(searchParamas.get("page") || 1)

  const filters = `${
    seller_handle
      ? `seller.handle:${seller_handle} AND `
      : ""
  }NOT seller.store_status:SUSPENDED${
    category_id
      ? ` AND categories.id:${category_id}${
          collection_id !== undefined
            ? ` AND collections.id:${collection_id}`
            : ""
        } ${facetFilters}`
      : ` ${facetFilters}`
  }`

  return (
    <InstantSearchNext searchClient={client} indexName="products">
      <Configure
        query={query}
        filters={filters}
        hitsPerPage={PRODUCT_LIMIT}
        page={Math.max(page - 1, 0)}
      />
      <ProductsListing
        locale={locale}
        currency_code={currency_code}
        filters={filters}
      />
    </InstantSearchNext>
  )
}

const ProductsListing = ({
  locale,
  currency_code,
  filters,
}: {
  locale?: string
  currency_code: string
  filters: string
}) => {
  const [apiProducts, setApiProducts] = useState<
    HttpTypes.StoreProduct[] | null
  >(null)
  const [isHydratingProducts, setIsHydratingProducts] = useState(true)
  const { items, results } = useHits()
  const itemHandles = useMemo(
    () => items.map((item) => item.handle).filter(Boolean),
    [items]
  )

  const searchParamas = useSearchParams()

  useEffect(() => {
    let isMounted = true

    const setProducts = async () => {
      if (!itemHandles.length) {
        if (isMounted) {
          setApiProducts([])
          setIsHydratingProducts(false)
        }

        return
      }

      try {
        setIsHydratingProducts(true)

        const { response } = await listProducts({
          countryCode: locale,
          queryParams: {
            fields:
              "*variants.calculated_price,*seller.reviews,-thumbnail,-images,-type,-tags,-variants.options,-options,-collection,-collection_id",
            handle: itemHandles,
            limit: itemHandles.length,
          },
        })

        if (isMounted) {
          setApiProducts(response.products)
          setIsHydratingProducts(false)
        }
      } catch {
        if (isMounted) {
          setApiProducts([])
          setIsHydratingProducts(false)
        }
      }
    }

    setProducts()

    return () => {
      isMounted = false
    }
  }, [itemHandles, locale])

  if (isHydratingProducts && apiProducts === null)
    return <ProductListingSkeleton />

  const products = items.filter((pr) =>
    apiProducts.some(
      (p: any) => p.id === pr.objectID && filterProductsByCurrencyCode(p)
    )
  )

  const count = products.length
  const pages = results?.nbPages || 1

  function filterProductsByCurrencyCode(product: HttpTypes.StoreProduct) {
    const minPrice = searchParamas.get("min_price")
    const maxPrice = searchParamas.get("max_price")

    if ([minPrice, maxPrice].some((price) => typeof price === "string")) {
      const variantsWithCurrencyCode = product?.variants?.filter(
        (variant) => variant.calculated_price?.currency_code === currency_code
      )

      if (!variantsWithCurrencyCode?.length) {
        return false
      }

      if (minPrice && maxPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) >= +minPrice &&
            (variant.calculated_price?.calculated_amount ?? 0) <= +maxPrice
        )
      }
      if (minPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) >= +minPrice
        )
      }
      if (maxPrice) {
        return variantsWithCurrencyCode.some(
          (variant) =>
            (variant.calculated_price?.calculated_amount ?? 0) <= +maxPrice
        )
      }
    }

    return true
  }

  return (
    <div className="min-h-[70vh]">
      <div className="flex justify-between w-full items-center">
        <div className="my-4 label-md">{`${count} listings`}</div>
      </div>
      <div className="hidden md:block">
        <ProductListingActiveFilters />
      </div>
      <div className="md:flex gap-4">
        <div className="w-[280px] flex-shrink-0 hidden md:block">
          <AlgoliaProductSidebar />
        </div>
        <div className="w-full">
          {!items.length ? (
            <div className="text-center w-full my-10">
              <h2 className="uppercase text-primary heading-lg">no results</h2>
              <p className="mt-4 text-lg">
                Sorry, we can&apos;t find any results for your criteria
              </p>
            </div>
          ) : (
            <div className="w-full">
              <ul className="flex flex-wrap gap-4">
                {products.map((hit) => (
                  <ProductCard
                    api_product={apiProducts.find(
                      (p: any) => p.id === hit.objectID
                    )}
                    key={hit.objectID}
                    product={hit}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <ProductsPagination pages={pages} />
    </div>
  )
}
