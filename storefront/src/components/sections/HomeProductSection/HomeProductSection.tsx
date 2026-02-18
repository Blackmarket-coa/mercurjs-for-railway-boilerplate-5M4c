import { HomeProductsCarousel } from "@/components/organisms"
import { Product } from "@/types/product"

export const HomeProductSection = async ({
  heading,
  locale = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pl",
  products = [],
  home = false,
}: {
  heading: string
  locale?: string
  products?: Product[]
  home?: boolean
}) => {
  const isFeaturedSection = heading.toLowerCase() === "featured products"

  return (
    <section
      className={
        isFeaturedSection
          ? "py-10 w-full rounded-3xl border border-zinc-200/70 bg-gradient-to-b from-white to-zinc-50/70 px-4 md:px-6"
          : "py-8 w-full"
      }
    >
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <h2 className="heading-lg font-bold tracking-tight uppercase">{heading}</h2>
          {isFeaturedSection && (
            <p className="text-sm text-zinc-600 md:text-base">
              Curated picks from Black Market creators.
            </p>
          )}
        </div>
      </div>
      <HomeProductsCarousel
        locale={locale}
        sellerProducts={products.slice(0, 4)}
        home={home}
      />
    </section>
  )
}
