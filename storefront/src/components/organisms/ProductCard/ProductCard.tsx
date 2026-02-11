"use client"

import Image from "next/image"
import { Button } from "@/components/atoms"
import { HttpTypes } from "@medusajs/types"
import { BaseHit, Hit } from "instantsearch.js"
import clsx from "clsx"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import { normalizeImageUrl } from "@/lib/helpers/normalize-image-url"

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
  const sellerName = (product as any).seller?.name || 
    (product as any).vendor?.name || 
    (api_product as any)?.metadata?.producer_name ||
    (api_product as any)?.metadata?.seller_name ||
    null
  
  const sellerHandle = (product as any).seller?.handle ||
    (product as any).vendor?.handle ||
    (api_product as any)?.metadata?.producer_handle ||
    null

  // Producer-forward variant
  if (variant === "producer-forward") {
    return (
      <div
        className={clsx(
          "relative group border border-gray-100 rounded-lg flex flex-col justify-between bg-white hover:shadow-lg hover:border-green-200 transition-all duration-200 w-full lg:w-[calc(25%-1rem)] min-w-[250px]"
        )}
      >
        <div className="relative w-full bg-gray-50 aspect-square overflow-hidden rounded-t-lg">
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            aria-label={`View ${productName}`}
            title={`View ${productName}`}
          >
            {normalizedThumbnail ? (
              <Image
                priority
                fetchPriority="high"
                src={normalizedThumbnail}
                alt={`${productName} image`}
                width={100}
                height={100}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover aspect-square w-full object-center h-full group-hover:scale-105 transition-transform duration-300"
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
                className="object-cover w-full h-full"
              />
            )}
          </LocalizedClientLink>
        </div>
        
        <div className="p-4 flex flex-col gap-1.5">
          {/* Producer name - primary emphasis */}
          {sellerName && (
            <LocalizedClientLink
              href={sellerHandle ? `/sellers/${sellerHandle}` : `/producers`}
              className="text-sm font-medium text-green-800 hover:text-green-900 transition-colors"
            >
              {sellerName}
            </LocalizedClientLink>
          )}
          
          {/* Product name */}
          <LocalizedClientLink
            href={`/products/${product.handle}`}
            aria-label={`Go to ${productName} page`}
            title={`Go to ${productName} page`}
          >
            <h3 className="text-base text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors">
              {product.title}
            </h3>
          </LocalizedClientLink>
          
          {/* Price */}
          <div className="flex items-center gap-2 mt-1">
            <p className="font-semibold text-gray-900">{cheapestPrice?.calculated_price}</p>
            {cheapestPrice?.calculated_price !== cheapestPrice?.original_price && (
              <p className="text-sm text-gray-400 line-through">
                {cheapestPrice?.original_price}
              </p>
            )}
          </div>
          
          {/* Impact tag */}
          {impactTag && (
            <span className="inline-flex items-center mt-2 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full w-fit">
              {impactTag}
            </span>
          )}
        </div>
      </div>
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
