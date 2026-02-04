import { Carousel } from "@/components/cells"
import { CategoryCard } from "@/components/organisms"

export const categories: { id: number; name: string; handle: string; description?: string }[] = [
  {
    id: 1,
    name: "Direct Marketplace",
    handle: "direct-marketplace",
    description: "Shop creator storefronts at retail pricing",
  },
  {
    id: 2,
    name: "Pre-Order Drops",
    handle: "pre-order-drops",
    description: "Secure limited-run releases early",
  },
  {
    id: 3,
    name: "Subscriptions",
    handle: "subscriptions",
    description: "Recurring boxes and creator memberships",
  },
  {
    id: 4,
    name: "Wholesale",
    handle: "wholesale",
    description: "Bulk pricing for retailers and teams",
  },
  {
    id: 5,
    name: "Digital Downloads",
    handle: "digital-downloads",
    description: "Instant access to files, courses, and tools",
  },
  {
    id: 6,
    name: "Services",
    handle: "services",
    description: "Book consulting, coaching, and creative help",
  },
  {
    id: 7,
    name: "Local Pickup",
    handle: "local-pickup",
    description: "Nearby pickup and community delivery",
  },
  {
    id: 8,
    name: "Custom Orders",
    handle: "custom-orders",
    description: "Made-to-order pieces and bespoke requests",
  },
  {
    id: 9,
    name: "Partnerships",
    handle: "partnerships",
    description: "Collaborations with brands and collectives",
  },
  {
    id: 10,
    name: "Community Drops",
    handle: "community-drops",
    description: "Group sales and limited community offers",
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
          <CategoryCard key={category.handle} category={category} />
        ))}
      />
    </section>
  )
}
