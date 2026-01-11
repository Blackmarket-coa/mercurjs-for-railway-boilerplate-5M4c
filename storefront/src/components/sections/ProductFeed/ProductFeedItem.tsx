"use client"

import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { getProductPrice } from "@/lib/helpers/get-product-price"
import clsx from "clsx"
import { FeedLayout } from "./ProductFeed"

interface ProductFeedItemProps {
  product: HttpTypes.StoreProduct & { seller?: SellerProps }
  layout: FeedLayout
  priority?: boolean
}

export const ProductFeedItem = ({
  product,
  layout,
  priority = false,
}: ProductFeedItemProps) => {
  const { cheapestPrice } = getProductPrice({ product })
  const productName = product.title || "Product"
  const seller = product.seller

  // Format relative time
  const getRelativeTime = (dateString?: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  // Grid Layout
  if (layout === "grid" || layout === "masonry") {
    return (
      <article
        className={clsx(
          "group relative bg-white border border-gray-100 rounded-xl overflow-hidden",
          "hover:shadow-lg hover:border-green-200 transition-all duration-300",
          layout === "masonry" && "break-inside-avoid mb-4"
        )}
      >
        {/* Image Container */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block relative aspect-square overflow-hidden bg-gray-50"
        >
          {product.thumbnail ? (
            <Image
              src={decodeURIComponent(product.thumbnail)}
              alt={`${productName} image`}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image
                src="/images/placeholder.svg"
                alt={`${productName} placeholder`}
                width={200}
                height={200}
                className="opacity-50"
              />
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm shadow-lg">
              Quick View
            </span>
          </div>
        </LocalizedClientLink>

        {/* Content */}
        <div className="p-4">
          {/* Seller Info */}
          {seller && (
            <LocalizedClientLink
              href={seller.handle ? `/sellers/${seller.handle}` : "/producers"}
              className="flex items-center gap-2 mb-2 group/seller"
            >
              {seller.photo && (
                <Image
                  src={seller.photo}
                  alt={seller.name || "Seller"}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-green-700 group-hover/seller:text-green-800 transition-colors truncate">
                {seller.name}
              </span>
              {seller.verified && (
                <svg
                  className="w-4 h-4 text-green-600 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </LocalizedClientLink>
          )}

          {/* Product Title */}
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors mb-2">
              {productName}
            </h3>
          </LocalizedClientLink>

          {/* Price & Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {cheapestPrice?.calculated_price}
              </span>
              {cheapestPrice?.calculated_price !== cheapestPrice?.original_price && (
                <span className="text-sm text-gray-400 line-through">
                  {cheapestPrice?.original_price}
                </span>
              )}
            </div>
            {product.created_at && (
              <span className="text-xs text-gray-400">
                {getRelativeTime(product.created_at)}
              </span>
            )}
          </div>

          {/* Tags / Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.categories.slice(0, 2).map((category) => (
                <span
                  key={category.id}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  // List Layout
  return (
    <article className="group flex gap-4 md:gap-6 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-green-200 transition-all duration-300">
      {/* Image */}
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="relative w-32 h-32 md:w-48 md:h-48 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50"
      >
        {product.thumbnail ? (
          <Image
            src={decodeURIComponent(product.thumbnail)}
            alt={`${productName} image`}
            fill
            sizes="200px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/images/placeholder.svg"
              alt={`${productName} placeholder`}
              width={100}
              height={100}
              className="opacity-50"
            />
          </div>
        )}
      </LocalizedClientLink>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Seller Info */}
          {seller && (
            <LocalizedClientLink
              href={seller.handle ? `/sellers/${seller.handle}` : "/producers"}
              className="flex items-center gap-2 mb-2 group/seller"
            >
              {seller.photo && (
                <Image
                  src={seller.photo}
                  alt={seller.name || "Seller"}
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              )}
              <span className="text-sm font-medium text-green-700 group-hover/seller:text-green-800 transition-colors">
                {seller.name}
              </span>
              {seller.verified && (
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {product.created_at && (
                <span className="text-xs text-gray-400">
                  {getRelativeTime(product.created_at)}
                </span>
              )}
            </LocalizedClientLink>
          )}

          {/* Product Title */}
          <LocalizedClientLink href={`/products/${product.handle}`}>
            <h3 className="font-medium text-lg text-gray-900 line-clamp-2 group-hover:text-green-700 transition-colors mb-2">
              {productName}
            </h3>
          </LocalizedClientLink>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Tags */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.categories.slice(0, 3).map((category) => (
                <span
                  key={category.id}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                >
                  {category.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xl font-semibold text-gray-900">
            {cheapestPrice?.calculated_price}
          </span>
          {cheapestPrice?.calculated_price !== cheapestPrice?.original_price && (
            <span className="text-sm text-gray-400 line-through">
              {cheapestPrice?.original_price}
            </span>
          )}
        </div>
      </div>

      {/* Actions (desktop) */}
      <div className="hidden md:flex flex-col gap-2 items-end justify-between">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
        >
          View Details
        </LocalizedClientLink>
      </div>
    </article>
  )
}
