"use client"

import { HttpTypes } from "@medusajs/types"
import { Carousel } from "@/components/cells"
import { client } from "@/lib/client"
import { Configure, useHits } from "react-instantsearch"
import { InstantSearchNext } from "react-instantsearch-nextjs"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { useEffect, useState } from "react"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const AlgoliaProductsCarousel = ({
  locale,
  seller_handle,
  currency_code,
}: {
  locale: string
  seller_handle?: string
  currency_code: string
}) => {
  const filters = `${
    seller_handle
      ? `NOT seller:null AND seller.handle:${seller_handle} AND `
      : "NOT seller:null AND "
  }NOT seller.store_status:SUSPENDED AND variants.prices.currency_code:${currency_code}`

  return (
    <InstantSearchNext searchClient={client} indexName="products">
      <Configure hitsPerPage={4} filters={filters} />
      <ProductsListing locale={locale} />
    </InstantSearchNext>
  )
}

const ProductsListing = ({ locale }: { locale: string }) => {
  const [prod, setProd] = useState<HttpTypes.StoreProduct[] | null>(null)
  const { items } = useHits()

  useEffect(() => {
    if (!items.length) return

    listProducts({
      countryCode: locale,
      queryParams: {
        fields:
          "*variants.calculated_price,*seller.reviews,-thumbnail,-images,-type,-tags,-variants.options,-options,-collection,-collection_id",
        handle: items.map((item) => item.handle),
        limit: items.length,
      },
    }).then(({ response }) => {
      setProd(response.products)
    })
  }, [items, locale])

  if (!items.length) {
    return (
      <div className="text-center w-full my-10">
        <h2 className="uppercase text-primary heading-lg">no results</h2>
        <p className="mt-4 text-lg">
          Sorry, we can&apos;t find any results for your criteria
        </p>
      </div>
    )
  }

  if (prod === null) return null

  const visibleItems = items.filter((hit) =>
    prod.some((p) => {
      const { cheapestPrice } = getProductPrice({ product: p })
      return p.id === hit.objectID && Boolean(cheapestPrice)
    })
  )

  if (!visibleItems.length) return null

  return (
    <div className="w-full">
      <Carousel
        align="start"
        items={visibleItems.map((hit) => (
          <ProductCard
            key={hit.objectID}
            product={hit}
            api_product={prod.find((p) => p.id === hit.objectID)}
          />
        ))}
      />
    </div>
  )
}
