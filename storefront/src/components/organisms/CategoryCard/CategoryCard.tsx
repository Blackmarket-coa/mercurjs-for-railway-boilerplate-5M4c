import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

// Category emoji mapping - solar punk themed icons
const categoryEmojis: Record<string, string> = {
  // Product categories
  "apparel": "👕",
  "clothing": "🧥",
  "electronics": "⚡",
  "home-garden": "🌻",
  "home-&-garden": "🌻",
  "crafted": "🪡",
  "food-beverage": "🌿",
  "digital-products": "💿",
  "bulk": "🌾",
  "services": "🪴",
  "accessories": "🎒",
  // Legacy/marketplace categories
  "direct-marketplace": "🌻",
  "pre-order-drops": "🌅",
  "subscriptions": "🍃",
  "wholesale": "🏡",
  "digital-downloads": "💿",
  "local-pickup": "🚴",
  "custom-orders": "🪡",
  "partnerships": "🌈",
  "community-drops": "🌾",
}

export function CategoryCard({
  category,
}: {
  category: { name: string; handle: string; description?: string }
}) {
  const emoji = categoryEmojis[category.handle] || "🛍️"

  return (
    <LocalizedClientLink
      href={`/categories/${category.handle}`}
      className="relative flex flex-col items-center justify-center border border-emerald-200/80 rounded-2xl bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 transition-all hover:shadow-xl hover:-translate-y-1 hover:border-emerald-400 w-[200px] min-h-[200px] p-4 group text-center"
    >
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),transparent_65%)]" />
      <div className="relative flex items-center justify-center w-16 h-16 mb-3 text-3xl rounded-full bg-white/70 border border-emerald-200 shadow-sm group-hover:bg-white">
        <span aria-hidden="true">{emoji}</span>
      </div>
      <h3 className="relative w-full font-semibold text-emerald-950 text-sm leading-tight">
        {category.name}
      </h3>
      {category.description && (
        <p className="relative w-full text-xs text-emerald-900/80 mt-1 leading-snug line-clamp-2">
          {category.description}
        </p>
      )}
    </LocalizedClientLink>
  )
}
