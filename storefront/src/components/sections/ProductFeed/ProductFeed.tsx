"use client"

import { useState } from "react"
import { ProductFeedItem } from "./ProductFeedItem"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"
import clsx from "clsx"

export type FeedLayout = "grid" | "list" | "masonry"
export type FeedMode = "trending" | "recent" | "featured" | "personalized" | "following"

interface ProductFeedProps {
  products: (HttpTypes.StoreProduct & { seller?: SellerProps })[]
  initialLayout?: FeedLayout
  mode?: FeedMode
  title?: string
  subtitle?: string
  showLayoutToggle?: boolean
  showFilters?: boolean
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

export const ProductFeed = ({
  products,
  initialLayout = "grid",
  mode = "trending",
  title,
  subtitle,
  showLayoutToggle = true,
  showFilters = false,
  onLoadMore,
  hasMore = false,
  loading = false,
  emptyMessage = "No products found. Check back soon!",
  className,
}: ProductFeedProps) => {
  const [layout, setLayout] = useState<FeedLayout>(initialLayout)
  const [activeFilter, setActiveFilter] = useState<string>("all")

  const filters = [
    { id: "all", label: "All" },
    { id: "food", label: "Food & Produce" },
    { id: "crafts", label: "Handcrafted" },
    { id: "services", label: "Services" },
    { id: "digital", label: "Digital" },
  ]

  const getModeLabel = (mode: FeedMode): string => {
    switch (mode) {
      case "trending":
        return "Trending Now"
      case "recent":
        return "Just Joined"
      case "featured":
        return "Featured Picks"
      case "personalized":
        return "For You"
      case "following":
        return "From Creators You Follow"
      default:
        return "Products"
    }
  }

  const getLayoutClasses = (): string => {
    switch (layout) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      case "list":
        return "flex flex-col gap-4"
      case "masonry":
        return "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    }
  }

  if (!products?.length && !loading) {
    return (
      <section className={clsx("w-full py-8", className)}>
        {title && (
          <h2 className="mb-6 heading-lg font-bold tracking-tight uppercase">
            {title}
          </h2>
        )}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={clsx("w-full py-8", className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="heading-lg font-bold tracking-tight uppercase">
            {title || getModeLabel(mode)}
          </h2>
          {subtitle && (
            <p className="text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Filters */}
          {showFilters && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    activeFilter === filter.id
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}

          {/* Layout Toggle */}
          {showLayoutToggle && (
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setLayout("grid")}
                className={clsx(
                  "p-2 transition-colors",
                  layout === "grid"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                )}
                aria-label="Grid view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setLayout("list")}
                className={clsx(
                  "p-2 transition-colors",
                  layout === "list"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                )}
                aria-label="List view"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <div className={getLayoutClasses()}>
        {products.map((product, index) => (
          <ProductFeedItem
            key={product.id}
            product={product}
            layout={layout}
            priority={index < 4}
          />
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}

      {/* Load More */}
      {hasMore && onLoadMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </section>
  )
}
