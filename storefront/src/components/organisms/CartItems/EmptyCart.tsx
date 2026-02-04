import { Button } from "@/components/atoms"
import { Carousel } from "@/components/cells"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { CategoryCard } from "../CategoryCard/CategoryCard"
import { listFeaturedCategories } from "@/lib/data/categories"

export const EmptyCart = async () => {
  const featuredCategories = await listFeaturedCategories()

  return (
    <div>
      <div className="py-4 h-full w-full md:w-[426px] md:mx-auto flex flex-col items-center justify-center mb-16">
        <h4 className="heading-md uppercase text-center text-primary">
          Shopping cart
        </h4>
        <p className="text-lg text-center py-2">
          Your shopping cart is currently empty.
        </p>
        <p className="text-sm text-center text-gray-500 mb-4">
          Discover products from Black-owned businesses
        </p>
        <LocalizedClientLink href="/categories" className="w-full mt-2">
          <Button className="w-full py-3 md:px-24 uppercase">Shop Now</Button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/producers" className="w-full mt-3">
          <Button variant="tonal" className="w-full py-3 md:px-24 uppercase">Meet Our Producers</Button>
        </LocalizedClientLink>
      </div>
      <div className="mb-8">
        <h3 className="heading-sm text-center mb-6 uppercase">Browse Categories</h3>
        {featuredCategories.length > 0 ? (
          <Carousel
            items={featuredCategories.map((category) => (
              <CategoryCard key={category.handle} category={category} />
            ))}
          />
        ) : (
          <p className="text-sm text-secondary text-center">
            Categories are loading. Check back soon for more to explore.
          </p>
        )}
      </div>
    </div>
  )
}
