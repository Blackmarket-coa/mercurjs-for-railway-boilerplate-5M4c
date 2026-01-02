import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

// Category emoji mapping for visual appeal
const categoryEmojis: Record<string, string> = {
  "food-beverages": "🍯",
  "beauty-wellness": "✨",
  "art-home": "🎨",
  "fashion": "👗",
  "handmade": "🧵",
  "books-media": "📚",
  "kids-baby": "🧸",
  "services": "💼",
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
      className="relative flex flex-col items-center justify-center border border-border rounded-xl bg-component transition-all hover:shadow-lg hover:scale-105 hover:border-primary w-[200px] h-[180px] p-4 group"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-3 text-4xl bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
        {emoji}
      </div>
      <h3 className="w-full text-center font-semibold text-primary text-sm">
        {category.name}
      </h3>
      {category.description && (
        <p className="w-full text-center text-xs text-secondary mt-1 line-clamp-2">
          {category.description}
        </p>
      )}
    </LocalizedClientLink>
  )
}
