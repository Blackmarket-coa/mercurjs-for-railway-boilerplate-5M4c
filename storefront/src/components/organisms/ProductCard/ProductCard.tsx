"use client"

import Image from "next/image"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { BaseHit, Hit } from "instantsearch.js"
import clsx from "clsx"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { normalizeImageUrl } from "@/lib/helpers/normalize-image-url"
import { ArrowUpRight } from "lucide-react"

type ProductCardVariant = "default" | "producer-forward"

interface ProductCardProps {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>
  api_product?: HttpTypes.StoreProduct | null
  /** Producer-forward shows the seller/producer name prominently above product name */
  variant?: ProductCardVariant
  /** Impact tag to show (e.g., "Supports local gardens", "Regenerative") */
  impactTag?: string
}

const safelyDecodeImageUrl = (url: string) => {
  try {
    return decodeURIComponent(url)
  } catch {
    return url
  }
}

export const ProductCard = ({
  product,
  api_product,
  variant = "default",
  impactTag,
}: ProductCardProps) => {
  if (!api_product) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: api_product! as HttpTypes.StoreProduct,
  })

  const productName = String(product.title || "Product")
  const normalizedThumbnail = safelyDecodeImageUrl(
    normalizeImageUrl(api_product?.thumbnail || product.thumbnail || "")
  )

  // Get seller/producer info from product metadata or collection
  const sellerName =
    (product as any).seller?.name ||
    (product as any).vendor?.name ||
    (api_product as any)?.metadata?.producer_name ||
    (api_product as any)?.metadata?.seller_name ||
    null

  const sellerHandle =
    (product as any).seller?.handle ||
    (product as any).vendor?.handle ||
    (api_product as any)?.metadata?.producer_handle ||
    null

  // Producer-forward variant
  if (variant === "producer-forward") {
    return (
      <article
        className={clsx(
          "group relative min-w-[260px] w-full overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/95 shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-[0_16px_44px_rgba(0,0,0,0.1)] lg:w-[calc(25%-1rem)]"
        )}
      >
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${productName}`}
          title={`View ${productName}`}
          className="block"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
            {normalizedThumbnail ? (
              <Image
                priority
                fetchPriority="high"
                src={normalizedThumbnail}
                alt={`${productName} image`}
                width={720}
                height={540}
                sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                priority
                fetchPriority="high"
                src="/images/placeholder.svg"
                alt={`${productName} image placeholder`}
                width={720}
                height={540}
                sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 30vw, (min-width: 640px) 48vw, 100vw"
                className="h-full w-full object-cover"
              />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-black/0 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
          </div>
        </LocalizedClientLink>

        <div className="space-y-3 p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              {sellerName && (
                <LocalizedClientLink
                  href={sellerHandle ? `/sellers/${sellerHandle}` : "/producers"}
                  className="inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500 transition-colors hover:text-zinc-800"
                >
                  {sellerName}
                </LocalizedClientLink>
              )}
              <LocalizedClientLink
                href={`/products/${product.handle}`}
                aria-label={`Go to ${productName} page`}
                title={`Go to ${productName} page`}
              >
                <h3 className="line-clamp-2 text-base font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 md:text-lg">
                  {product.title}
                </h3>
              </LocalizedClientLink>
            </div>

            <LocalizedClientLink
              href={`/products/${product.handle}`}
              aria-label={`See more about ${productName}`}
              title={`See more about ${productName}`}
              className="rounded-full border border-zinc-200 bg-white p-2 text-zinc-700 transition-all hover:border-zinc-300 hover:text-zinc-950"
            >
              <ArrowUpRight size={16} />
            </LocalizedClientLink>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-zinc-100 pt-3">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-zinc-900">
                {cheapestPrice?.calculated_price}
              </p>
              {cheapestPrice?.calculated_price !== cheapestPrice?.original_price && (
                <p className="text-sm text-zinc-400 line-through">
                  {cheapestPrice?.original_price}
                </p>
              )}
            </div>

            {impactTag && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {impactTag}
              </span>
            )}
          </div>
        </div>
      </article>
    )
  }

  // Default variant (original)
  return (
    <div
      className={clsx(
        "relative group border rounded-sm flex flex-col justify-between p-1 w-full lg:w-[calc(25%-1rem)] min-w-[250px]"
      )}
    >
      <div className="relative w-full h-full bg-primary aspect-square">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`View ${productName}`}
          title={`View ${productName}`}
        >
          <div className="overflow-hidden rounded-sm w-full h-full flex justify-center align-center ">
            {normalizedThumbnail ? (
              <Image
                priority
                fetchPriority="high"
                src={normalizedThumbnail}
                alt={`${productName} image`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover aspect-square w-full object-center h-full lg:group-hover:-mt-14 transition-all duration-300 rounded-xs"
              />
            ) : (
              <Image
                priority
                fetchPriority="high"
                src="/images/placeholder.svg"
                alt={`${productName} image placeholder`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
            )}
          </div>
        </LocalizedClientLink>
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          aria-label={`See more about ${productName}`}
          title={`See more about ${productName}`}
        >
          <Button className="absolute rounded-sm bg-action text-action-on-primary h-auto lg:h-[48px] lg:group-hover:block hidden w-full uppercase bottom-1 z-10">
            See More
          </Button>
        </LocalizedClientLink>
      </div>
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        aria-label={`Go to ${productName} page`}
        title={`Go to ${productName} page`}
      >
        <div className="flex justify-between p-4">
          <div className="w-full">
            {/* Show seller name if available */}
            {sellerName && (
              <p className="text-xs font-medium text-green-700 mb-1">{sellerName}</p>
            )}
            <h3 className="heading-sm truncate">{product.title}</h3>
            <div className="flex items-center gap-2 mt-2">
              <p className="font-medium">{cheapestPrice?.calculated_price}</p>
              {cheapestPrice?.calculated_price !==
                cheapestPrice?.original_price && (
                <p className="text-sm text-gray-500 line-through">
                  {cheapestPrice?.original_price}
                </p>
              )}
            </div>
          </div>
        </div>
      </LocalizedClientLink>
    </div>
  )
}
