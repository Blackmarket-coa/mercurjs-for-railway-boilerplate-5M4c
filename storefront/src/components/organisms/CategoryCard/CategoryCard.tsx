import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

// Category emoji mapping for visual appeal
const categoryEmojis: Record<string, string> = {
  "direct-marketplace": "🛒",
  "pre-order-drops": "⏳",
  "subscriptions": "🔁",
  "wholesale": "📦",
  "digital-downloads": "💾",
  "services": "💼",
  "local-pickup": "📍",
  "custom-orders": "✍️",
  "partnerships": "🤝",
  "community-drops": "🎉",
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
      className="relative flex flex-col items-center justify-center border border-border rounded-xl bg-component transition-all hover:shadow-lg hover:scale-105 hover:border-primary w-[200px] min-h-[200px] p-4 group text-center"
    >
      <div className="flex items-center justify-center w-14 h-14 mb-3 text-3xl bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
        {emoji}
      </div>
      <h3 className="w-full font-semibold text-primary text-sm leading-tight">
        {category.name}
      </h3>
      {category.description && (
        <p className="w-full text-xs text-secondary mt-1 leading-snug line-clamp-2">
          {category.description}
        </p>
      )}
    </LocalizedClientLink>
  )
}
