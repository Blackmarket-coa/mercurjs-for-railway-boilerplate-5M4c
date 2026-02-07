import {
  BannerSection,
  BlogSection,
  Hero,
  HomeCategories,
  HomeProductSection,
  ShopByStyleSection,
  JustJoinedVendors,
} from "@/components/sections"
import { ValueProposition, BecomeProducerCTA } from "@/components/molecules"

import type { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { toHreflang } from "@/lib/helpers/hreflang"

/* -----------------------------
   METADATA (SERVER-SAFE)
------------------------------ */
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

  let languages: Record<string, string> = {
    [toHreflang(locale)]: `${baseUrl}/${locale}`,
  }

  try {
    const regions = await listRegions()
    const locales = Array.from(
      new Set(
        (regions ?? [])
          .flatMap((r) => r.countries?.map((c) => c.iso_2) ?? [])
          .filter(Boolean)
      )
    ) as string[]

    languages = locales.reduce<Record<string, string>>((acc, code) => {
      acc[toHreflang(code)] = `${baseUrl}/${code}`
      return acc
    }, {})
  } catch (error) {
    console.error("[generateMetadata] listRegions failed:", error)
    // Safe fallback already set
  }

  const title = "Home"
  const description =
    "A community-owned marketplace where creators keep 97% of every sale. Shop farm-fresh produce, handcrafted goods, digital products, event tickets, rentals, and services. Invest in local producers, join community gardens and kitchens, or open your own storefront."
  const ogImage = "/B2C_Storefront_Open_Graph.png"
  const canonical = `${baseUrl}/${locale}`
  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "Black Market Coalition - Direct from Makers"

  return {
    title,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": baseUrl,
      },
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: canonical,
      siteName,
      type: "website",
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`,
      ],
    },
  }
}

/* -----------------------------
   PAGE (SERVER-SAFE)
------------------------------ */
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const headersList = await headers()
  const host = headersList.get("host")
  const protocol = headersList.get("x-forwarded-proto") || "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`

  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "Black Market Coalition"

  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start text-primary">
      {/* Hero preload (safe) */}
      <link
        rel="preload"
        as="image"
        href="/images/hero/Image.jpg"
      />

      {/* Organization JSON-LD */}
      <Script
        id="ld-org"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            logo: `${baseUrl}/favicon.ico`,
          }),
        }}
      />

      {/* WebSite JSON-LD */}
      <Script
        id="ld-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: `${baseUrl}/${locale}`,
            inLanguage: toHreflang(locale),
          }),
        }}
      />

      <Hero
        variant="mission"
        image="/images/hero/Image.jpg"
        heading="Shop, sell, invest, and grow—in a marketplace owned by its community."
        paragraph="Browse farm-fresh produce, handcrafted goods, digital products, event tickets, rentals, and professional services from verified independent creators who keep 97% of every sale. Invest directly in local producers, join community gardens and shared kitchens, or open your own storefront. Transparent pricing. Zero hidden fees."
        buttons={[
          { label: "Explore the Marketplace", path: "/categories" },
          { label: "See How It Works", path: "/how-it-works" },
        ]}
      />

      <div className="px-4 lg:px-8 w-full py-12">
        <ValueProposition />
      </div>

      <div className="px-4 lg:px-8 w-full">
        <HomeProductSection heading="trending listings" locale={locale} home />
      </div>

      <div className="px-4 lg:px-8 w-full">
        <JustJoinedVendors />
      </div>

      <div className="px-4 lg:px-8 w-full">
        <HomeCategories heading="SHOP BY SALES CHANNEL" />
      </div>

      <BannerSection />
      <ShopByStyleSection />

      <div className="px-4 lg:px-8 w-full py-8">
        <BecomeProducerCTA />
      </div>

      <BlogSection />
    </main>
  )
}
