import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { Suspense } from "react"

import { Breadcrumbs } from "@/components/atoms"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"
import { CategoryCard } from "@/components/organisms"
import { listFeaturedCategories } from "@/lib/data/categories"
import { getRegion } from "@/lib/data/regions"
import isBot from "@/lib/helpers/isBot"
import { headers } from "next/headers"
import type { Metadata } from "next"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { listProducts } from "@/lib/data/products"
import { toHreflang } from "@/lib/helpers/hreflang"

export const revalidate = 60

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

  let languages: Record<string, string> = {}
  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions || []).flatMap((r) => r.countries?.map((c) => c.iso_2) || [])
      )
    ) as string[]
    languages = locales.reduce<Record<string, string>>((acc, code) => {
      acc[toHreflang(code)] = `${baseUrl}/${code}/categories`
      return acc
    }, {})
  } catch {
    languages = { [toHreflang(locale)]: `${baseUrl}/${locale}/categories` }
  }

  const title = "Shop by Category"
  const description = `Discover products from conscious businesses. Browse food, beauty, art, fashion, handmade goods, and more on ${
    process.env.NEXT_PUBLIC_SITE_NAME || "FreeBlackMarket"
  }`
  const canonical = `${baseUrl}/${locale}/categories`

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": `${baseUrl}/categories` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${title} | ${process.env.NEXT_PUBLIC_SITE_NAME || "Storefront"}`,
      description,
      url: canonical,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Storefront",
      type: "website",
    },
  }
}

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

async function AllCategories({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const ua = (await headers()).get("user-agent") || ""
  const bot = isBot(ua)
  const featuredCategories = await listFeaturedCategories()

  const breadcrumbsItems = [
    {
      path: "/categories",
      label: "Shop by Category",
    },
  ]

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  // Fetch a small cached list for ItemList JSON-LD
  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`
  const {
    response: { products: jsonLdProducts },
  } = await listProducts({
    countryCode: locale,
    queryParams: { limit: 8, order: "created_at", fields: "id,title,handle" },
  })

  const itemList = jsonLdProducts.slice(0, 8).map((p, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${baseUrl}/${locale}/products/${p.handle}`,
    name: p.title,
  }))

  return (
    <main className="container">
      <Script
        id="ld-breadcrumbs-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Shop by Category",
                item: `${baseUrl}/${locale}/categories`,
              },
            ],
          }),
        }}
      />
      <Script
        id="ld-itemlist-categories"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: itemList,
          }),
        }}
      />
      <div className="hidden md:block mb-2">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      {/* Category Grid Section */}
      <section className="mb-12">
        <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-900 mb-4">
          <span className="text-lg">🌻</span>
          Free Black Market
        </div>
        <h1 className="heading-xl uppercase mb-2 text-emerald-950">
          Shop by Category
        </h1>
        <p className="text-emerald-900/80 mb-6">
          Discover products from conscious businesses across different categories
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 justify-items-center">
          {featuredCategories.length > 0 ? (
            featuredCategories.map((category) => (
              <CategoryCard key={category.handle} category={category} />
            ))
          ) : (
            <p className="text-sm text-secondary col-span-full text-center">
              Categories are loading. Check back soon for more to explore.
            </p>
          )}
        </div>
      </section>

      {/* All Products Section */}
      <section>
        <h2 className="heading-lg uppercase mb-4">All Products</h2>
        <Suspense fallback={<ProductListingSkeleton />}>
          {bot || !ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
            <ProductListing showSidebar locale={locale} />
          ) : (
            <AlgoliaProductsListing
              locale={locale}
              currency_code={currency_code}
            />
          )}
        </Suspense>
      </section>
    </main>
  )
}

export default AllCategories
