import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string; description?: string }[] = [
  {
    id: 1,
    name: "Food & Beverages",
    handle: "food-beverages",
    description: "Sauces, spices, snacks & drinks",
  },
  {
    id: 2,
    name: "Beauty & Wellness",
    handle: "beauty-wellness",
    description: "Skincare, haircare & self-care",
  },
  {
    id: 3,
    name: "Art & Home Decor",
    handle: "art-home",
    description: "Prints, paintings & decor",
  },
  {
    id: 4,
    name: "Fashion & Apparel",
    handle: "fashion",
    description: "Clothing & accessories",
  },
  {
    id: 5,
    name: "Handmade & Crafts",
    handle: "handmade",
    description: "Jewelry, candles & crafted goods",
  },
  {
    id: 6,
    name: "Books & Media",
    handle: "books-media",
    description: "Books, music & digital content",
  },
  {
    id: 7,
    name: "Kids & Baby",
    handle: "kids-baby",
    description: "Toys, clothing & essentials",
  },
  {
    id: 8,
    name: "Services",
    handle: "services",
    description: "Consulting, coaching & more",
  },
]

export const HomeCategories = async ({ heading }: { heading: string }) => {
  return (
    <section className="bg-primary py-8 w-full">
      <div className="mb-6">
        <h2 className="heading-lg text-primary uppercase">{heading}</h2>
      </div>
      <Carousel
        items={categories?.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      />
    </section>
  )
}
