import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string }[] = [
  {
    id: 1,
    name: "3D Printed Items",
    handle: "3d",
  },
  {
    id: 2,
    name: "Accessories",
    handle: "accessories",
  },
  {
    id: 3,
    name: "Components",
    handle: "components",
  },
  {
    id: 4,
    name: "Hand Crafted Items",
    handle: "crafted",
  },
  {
    id: 5,
    name: "Essentials",
    handle: "soap",
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
