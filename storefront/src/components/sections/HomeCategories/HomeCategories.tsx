import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"
import { listFeaturedCategories } from "@/lib/data/categories"

export const HomeCategories = async ({ heading }: { heading: string }) => {
  const featuredCategories = await listFeaturedCategories()

  if (featuredCategories.length === 0) {
    return null
  }

  return (
    <section className="bg-primary py-8 w-full">
      <div className="mb-6">
        <h2 className="heading-lg text-primary uppercase">{heading}</h2>
      </div>
      <Carousel
        items={featuredCategories.map((category) => (
          <CategoryCard key={category.handle} category={category} />
        ))}
      />
    </section>
  )
}
