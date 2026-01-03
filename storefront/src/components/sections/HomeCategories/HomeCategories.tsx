import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string; description?: string }[] = [
  {
    id: 1,
    name: "Apparel",
    handle: "apparel",
    description: "Clothing & fashion essentials",
  },
  {
    id: 2,
    name: "Electronics",
    handle: "electronics",
    description: "Tech gadgets & devices",
  },
  {
    id: 3,
    name: "Home & Garden",
    handle: "home-&-garden",
    description: "Decor, plants & home goods",
  },
  {
    id: 4,
    name: "Crafted",
    handle: "crafted",
    description: "Handmade & artisan goods",
  },
  {
    id: 5,
    name: "Food & Beverage",
    handle: "food-beverage",
    description: "Sauces, spices, snacks & drinks",
  },
  {
    id: 6,
    name: "Digital Products",
    handle: "digital-products",
    description: "Downloads, courses & digital content",
  },
  {
    id: 7,
    name: "Bulk & Wholesale",
    handle: "bulk",
    description: "Wholesale & bulk orders",
  },
  {
    id: 8,
    name: "Services",
    handle: "services",
    description: "Consulting, coaching & more",
  },
  {
    id: 9,
    name: "Accessories",
    handle: "accessories",
    description: "Bags, jewelry & add-ons",
  },
  {
    id: 10,
    name: "Clothing",
    handle: "clothing",
    description: "Shirts, pants & outerwear",
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
