import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/atoms"
import { ProductListingSkeleton } from "@/components/organisms/ProductListingSkeleton/ProductListingSkeleton"
import { AlgoliaProductsListing, ProductListing } from "@/components/sections"
import { getCollectionByHandle } from "@/lib/data/categories"
import { getRegion } from "@/lib/data/regions"
import isBot from "@/lib/helpers/isBot"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { isUnifiedListingEnabled } from "@/lib/feature-flags"

const ALGOLIA_ID = process.env.NEXT_PUBLIC_ALGOLIA_ID
const ALGOLIA_SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    return {
      title: "Collection Not Found",
      description: "This collection could not be found.",
    }
  }

  return {
    title: `${collection.title} | Collections`,
    description: collection.metadata?.description as string | undefined,
  }
}

const SingleCollectionsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const { handle, locale } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const ua = (await headers()).get("user-agent") || ""
  const bot = isBot(ua)
  const collection = await getCollectionByHandle(handle)

  if (!collection) {
    return notFound()
  }

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  const breadcrumbsItems = [
    {
      path: collection.handle,
      label: collection.title,
    },
  ]

  return (
    <main className="container">
      <div className="hidden md:block mb-2">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>

      <h1 className="heading-xl uppercase">{collection.title}</h1>

      <Suspense key={page} fallback={<ProductListingSkeleton />}>
        {isUnifiedListingEnabled() ? (
          <ProductListing collection_id={collection.id} showSidebar locale={locale} page={page} />
        ) : bot || !ALGOLIA_ID || !ALGOLIA_SEARCH_KEY ? (
          <ProductListing collection_id={collection.id} showSidebar locale={locale} page={page} />
        ) : (
          <AlgoliaProductsListing
            collection_id={collection.id}
            locale={locale}
            currency_code={currency_code}
          />
        )}
      </Suspense>
    </main>
  )
}

export default SingleCollectionsPage
