import { getProductFeed, FeedMode } from "@/lib/data/feed"
import { ProductFeed, FeedLayout } from "./ProductFeed"

interface ProductFeedServerProps {
  locale: string
  mode?: FeedMode
  title?: string
  subtitle?: string
  initialLayout?: FeedLayout
  limit?: number
  showLayoutToggle?: boolean
  showFilters?: boolean
  categoryId?: string
  className?: string
}

/**
 * Server component wrapper for ProductFeed
 * Fetches data on the server and hydrates the client component
 */
export async function ProductFeedServer({
  locale,
  mode = "trending",
  title,
  subtitle,
  initialLayout = "grid",
  limit = 12,
  showLayoutToggle = true,
  showFilters = false,
  categoryId,
  className,
}: ProductFeedServerProps) {
  const { products, nextPage, totalCount } = await getProductFeed({
    mode,
    countryCode: locale,
    limit,
    categoryId,
  })

  return (
    <ProductFeed
      products={products}
      mode={mode}
      title={title}
      subtitle={subtitle}
      initialLayout={initialLayout}
      showLayoutToggle={showLayoutToggle}
      showFilters={showFilters}
      hasMore={nextPage !== null}
      className={className}
    />
  )
}
