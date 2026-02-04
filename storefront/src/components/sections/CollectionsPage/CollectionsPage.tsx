"use client"

import Link from "next/link"
import { ForwardIcon } from "@/icons"

interface Collection {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any> | null
}

interface CollectionsPageProps {
  collections: Collection[]
}

// Nature-inspired palette for collection cards
const CARD_STYLES = [
  { bg: "from-emerald-500 via-green-500 to-lime-400", text: "text-white", icon: "🌞" },
  { bg: "from-teal-500 via-cyan-500 to-sky-400", text: "text-white", icon: "🌿" },
  { bg: "from-amber-500 via-orange-400 to-yellow-300", text: "text-white", icon: "🌻" },
  { bg: "from-lime-500 via-emerald-500 to-teal-400", text: "text-white", icon: "🍃" },
  { bg: "from-rose-500 via-pink-500 to-fuchsia-400", text: "text-white", icon: "🦋" },
  { bg: "from-cyan-500 via-sky-500 to-indigo-400", text: "text-white", icon: "💧" },
  { bg: "from-amber-400 via-lime-400 to-emerald-300", text: "text-white", icon: "⚡" },
  { bg: "from-green-600 via-emerald-500 to-teal-400", text: "text-white", icon: "🌱" },
]

export function CollectionsPage({ collections }: CollectionsPageProps) {
  if (!collections || collections.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shop by Collection
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Browse curated collections of products from our marketplace vendors.
          </p>
        </div>
        <div className="text-center py-16 bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 rounded-2xl border border-emerald-100">
          <p className="text-emerald-900">
            No collections available yet. Check back soon for curated product collections.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-emerald-200/80 bg-emerald-50/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-900 mb-4">
          <span className="text-xl">🌿</span>
          Curated Collections
        </div>
        <h1 className="text-3xl font-bold text-emerald-950 mb-2">
          Shop by Collection
        </h1>
        <p className="text-emerald-900/80 max-w-2xl">
          Browse curated collections of products from our marketplace vendors.
          Each collection is hand-picked to help you discover quality products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection, index) => {
          const colorScheme = CARD_STYLES[index % CARD_STYLES.length]
          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.55),transparent_65%)]" />
              <div
                className={`relative bg-gradient-to-br ${colorScheme.bg} p-6 h-44 flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl" aria-hidden="true">
                    {colorScheme.icon}
                  </span>
                  <span className="text-xs uppercase tracking-[0.3em] text-white/70">
                    Collection
                  </span>
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold ${colorScheme.text} group-hover:underline`}
                  >
                    {collection.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${colorScheme.text} opacity-80`}>
                    Browse collection
                  </span>
                  <ForwardIcon
                    className={`w-5 h-5 ${colorScheme.text} opacity-70 group-hover:translate-x-1 transition-transform`}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default CollectionsPage
