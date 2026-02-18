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
import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import Script from "next/script"
import { listRegions } from "@/lib/data/regions"
import { toHreflang } from "@/lib/helpers/hreflang"

const vendorTypeCards = [
  { label: "Physical Goods", href: "/what-you-sell#physical-goods", emoji: "📦" },
  { label: "Services", href: "/what-you-sell#services", emoji: "🛠️" },
  { label: "CSA / Subscriptions", href: "/what-you-sell#subscriptions-csa", emoji: "🥬" },
  { label: "Digital Products", href: "/what-you-sell#digital-products", emoji: "💻" },
  { label: "Event Tickets", href: "/what-you-sell#event-tickets", emoji: "🎟️" },
  { label: "Rentals", href: "/what-you-sell#rentals", emoji: "🧰" },
  { label: "Community Programs", href: "/what-you-sell#community-programs", emoji: "🤝" },
]

const dashboardShots = [
  {
    title: "Order management",
    image: "/algolia-import.png",
    caption: "Process incoming orders, update statuses, and coordinate fulfillment from one view.",
  },
  {
    title: "Payout tracking",
    image: "/talkjs-placeholder.jpg",
    caption: "Track payouts with clear Stripe Connect visibility and transparent fee math.",
  },
  {
    title: "Vendor messaging",
    image: "/components.jpg",
    caption: "Keep customer communication and fulfillment context in one operational workflow.",
  },
  {
    title: "Impact metrics",
    image: "/crafted.jpg",
    caption: "Measure community outcomes over time and show the impact your operation creates.",
  },
]

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
  }

  const title = "Home"
  const description =
    "One platform for producers, creators, organizers, and service providers. Sell goods, offer services, run subscriptions, host events, and track community impact while keeping 97% of every sale."
  const ogImage = "/B2C_Storefront_Open_Graph.png"
  const canonical = `${baseUrl}/${locale}`
  const siteName =
    process.env.NEXT_PUBLIC_SITE_NAME ||
    "Black Market Coalition - Community Commerce Infrastructure"

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
      <link
        rel="preload"
        as="image"
        href="/images/hero/Image.jpg"
      />

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
        heading="Community commerce infrastructure for goods, services, subscriptions, events, and local programs."
        paragraph="One platform for producers, creators, organizers, and service providers. Sell goods, offer services, run subscriptions, manage CSA shares, host events, rent community assets, and track local impact while keeping 97% of every sale."
        buttons={[
          { label: "Explore Goods, Services & Programs", path: "/what-you-sell" },
          { label: "Join as a Vendor", path: "/sell" },
        ]}
      />

      <section className="px-4 lg:px-8 w-full">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-green-700 mb-2">Built for Community Commerce</p>
          <h2 className="text-3xl font-semibold text-green-900 mb-4">This is infrastructure for local economic networks, not just storefront software.</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <div><span className="font-semibold">Products:</span> physical goods, local food, and digital downloads.</div>
            <div><span className="font-semibold">Services:</span> bookings, custom requests, and provider messaging.</div>
            <div><span className="font-semibold">Subscriptions & CSA:</span> recurring orders and share management.</div>
            <div><span className="font-semibold">Events & Programs:</span> tickets, rentals, and mission-driven initiatives.</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/feature-matrix" className="rounded-lg bg-green-700 px-4 py-2 text-white text-sm font-medium hover:bg-green-800">View feature matrix</Link>
            <Link href="/beyond-selling" className="rounded-lg border border-green-300 px-4 py-2 text-green-800 text-sm font-medium hover:bg-green-100">Beyond selling</Link>
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-8 w-full">
        <div className="rounded-2xl border p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">What Are You Selling?</h2>
          <p className="text-gray-600 mb-6">Choose your model and get a tailored setup path with how it works, best-fit examples, and fee details.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vendorTypeCards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="rounded-xl border px-4 py-3 hover:border-green-400 hover:bg-green-50 transition-colors"
                data-event="homepage_vendor_type_selected"
              >
                <p className="text-lg">{card.emoji}</p>
                <p className="font-medium">{card.label}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-8 w-full">
        <div className="rounded-2xl border p-6 md:p-8 bg-neutral-50">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">We take 3%. You keep 97%. No hidden platform tricks.</h2>
          <p className="text-gray-700 mb-4">Transparent Stripe Connect payouts, vendor-controlled fulfillment, and predictable unit economics.</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-white p-4 border"><p className="text-sm text-gray-500">Sale</p><p className="text-xl font-semibold">$100.00</p></div>
            <div className="rounded-lg bg-white p-4 border"><p className="text-sm text-gray-500">Coalition fee (3%)</p><p className="text-xl font-semibold">$3.00</p></div>
            <div className="rounded-lg bg-white p-4 border"><p className="text-sm text-gray-500">You keep</p><p className="text-xl font-semibold text-green-700">$97.00</p></div>
          </div>
          <Link href="/sell" className="text-green-700 font-medium underline">See this pricing in vendor onboarding</Link>
        </div>
      </section>

      <section className="px-4 lg:px-8 w-full">
        <div className="rounded-2xl border p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">Inside the Vendor Dashboard</h2>
          <p className="text-gray-600 mb-6">Operational proof for order management, payouts, messaging, and impact tracking.</p>
          <div className="grid gap-5 md:grid-cols-2">
            {dashboardShots.map((shot) => (
              <figure key={shot.title} className="rounded-xl border overflow-hidden bg-white">
                <Image src={shot.image} alt={shot.title} width={640} height={320} className="h-52 w-full object-cover" />
                <figcaption className="p-4">
                  <p className="font-medium">{shot.title}</p>
                  <p className="text-sm text-gray-600">{shot.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 lg:px-8 w-full">
        <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6 md:p-8">
          <h2 className="text-2xl font-semibold mb-2">Open Source. Community Governed.</h2>
          <p className="text-gray-700 mb-4">Improved onboarding system. Built on scalable open-source infrastructure with public transparency.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-900 px-4 py-2 text-white text-sm" data-event="github_transparency_link_clicked">View GitHub transparency</Link>
            <Link href="/why-we-exist" className="rounded-lg border border-slate-300 px-4 py-2 text-sm">Why we exist</Link>
          </div>
        </div>
      </section>

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
