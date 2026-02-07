import { ProductFeedServer } from "@/components/sections"
import type { Metadata } from "next"
import { headers } from "next/headers"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const title = "Product Feed"
  const description =
    "Browse the latest products from independent creators, makers, and entrepreneurs. Fresh listings updated daily."
  const canonical = `${baseUrl}/${locale}/feed`

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} | ${
        process.env.NEXT_PUBLIC_SITE_NAME || "Coalition Marketplace"
      }`,
      description,
      url: canonical,
      siteName:
        process.env.NEXT_PUBLIC_SITE_NAME ||
        "Black Market Coalition - Direct from Makers",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  }
}

export default async function FeedPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ mode?: string; category?: string }>
}) {
  const { locale } = await params
  const search = await searchParams
  const mode = (search.mode || "recent") as
    | "trending"
    | "recent"
    | "featured"
    | "personalized"
    | "following"

  const feedModes = [
    { id: "recent", label: "Just Joined", description: "Latest listings" },
    { id: "trending", label: "Trending", description: "Popular right now" },
    { id: "featured", label: "Featured", description: "Staff picks" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Feed
          </h1>
          <p className="text-gray-600">
            Discover products from independent creators in your community
          </p>

          {/* Mode Tabs */}
          <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
            {feedModes.map((feedMode) => (
              <LocalizedClientLink
                key={feedMode.id}
                href={`/feed?mode=${feedMode.id}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  mode === feedMode.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {feedMode.label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>

      {/* Feed Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <ProductFeedServer
          locale={locale}
          mode={mode}
          limit={24}
          showLayoutToggle={true}
          showFilters={true}
          categoryId={search.category}
        />
      </div>
    </main>
  )
}
