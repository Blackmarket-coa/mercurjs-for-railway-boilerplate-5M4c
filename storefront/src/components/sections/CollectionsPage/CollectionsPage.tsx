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

// Color palette for collection cards
const CARD_COLORS = [
  { bg: "from-green-400 to-emerald-500", text: "text-white" },
  { bg: "from-teal-400 to-cyan-500", text: "text-white" },
  { bg: "from-blue-400 to-indigo-500", text: "text-white" },
  { bg: "from-purple-400 to-violet-500", text: "text-white" },
  { bg: "from-orange-400 to-red-500", text: "text-white" },
  { bg: "from-amber-400 to-orange-500", text: "text-white" },
  { bg: "from-rose-400 to-pink-500", text: "text-white" },
  { bg: "from-cyan-400 to-blue-500", text: "text-white" },
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
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            No collections available yet. Check back soon for curated product collections.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Shop by Collection
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Browse curated collections of products from our marketplace vendors.
          Each collection is hand-picked to help you discover quality products.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {collections.map((collection, index) => {
          const colorScheme = CARD_COLORS[index % CARD_COLORS.length]
          return (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div
                className={`bg-gradient-to-br ${colorScheme.bg} p-6 h-40 flex flex-col justify-between`}
              >
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
