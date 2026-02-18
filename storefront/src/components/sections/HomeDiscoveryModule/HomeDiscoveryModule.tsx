"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import { emitWebsiteEvent } from "@/lib/analytics/events"

const quickFilters = [
  { label: "Category", value: "category:goods" },
  { label: "Price under $50", value: "price:<50" },
  { label: "Local pickup", value: "pickup:local" },
  { label: "Vendor type", value: "vendor:community" },
]

export const HomeDiscoveryModule = () => {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const params = new URLSearchParams()
    if (query.trim()) {
      params.set("q", query.trim())
    }

    emitWebsiteEvent("homepage_search_submitted", {
      query: query.trim() || "all",
    })

    router.push(`/collections${params.toString() ? `?${params.toString()}` : ""}`)
  }

  const onFilterClick = (filter: string) => {
    emitWebsiteEvent("homepage_quick_filter_used", {
      filter,
    })
  }

  return (
    <section className="px-4 lg:px-8 w-full -mt-2 md:-mt-4">
      <div className="rounded-2xl border border-green-200 bg-white p-6 md:p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-green-700 mb-2">Find what you need fast</p>
        <h2 className="text-2xl md:text-3xl font-semibold mb-3">Search the marketplace and filter by what matters most</h2>

        <form onSubmit={onSearch} className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="search"
            placeholder="Search products, services, events, and community programs"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm"
            aria-label="Search marketplace"
          />
          <button
            type="submit"
            className="rounded-lg bg-green-700 px-5 py-3 text-white text-sm font-medium hover:bg-green-800"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-4">
          {quickFilters.map((filter) => (
            <Link
              key={filter.value}
              href={`/collections?${new URLSearchParams({ filter: filter.value }).toString()}`}
              className="rounded-full border border-slate-300 px-3 py-2 text-sm leading-none hover:border-green-500 hover:bg-green-50 min-h-11 inline-flex items-center" aria-label={`Filter by ${filter.label}`}
              onClick={() => onFilterClick(filter.value)}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/collections?sort=trending"
            className="rounded-lg bg-slate-900 text-white px-4 py-3 min-h-11 inline-flex items-center"
            onClick={() => emitWebsiteEvent("homepage_primary_cta_clicked", { cta: "shop_trending" })}
            data-progress-target="trending"
          >
            Shop Trending
          </Link>
          <Link
            href="/collections?sort=best-sellers"
            className="rounded-lg border border-slate-300 px-4 py-3 min-h-11 inline-flex items-center"
            onClick={() => emitWebsiteEvent("homepage_secondary_cta_clicked", { cta: "browse_best_sellers" })}
            data-progress-target="best_sellers"
          >
            Browse Best Sellers
          </Link>
        </div>
      </div>
    </section>
  )
}
