import { Carousel } from "@/components/cells"
import { ProductCard } from "../ProductCard/ProductCard"
import { listProducts } from "@/lib/data/products"
import { Product } from "@/types/product"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@/lib/helpers/get-product-price"

export const HomeProductsCarousel = async ({
  locale,
  sellerProducts,
  home,
}: {
  locale: string
  sellerProducts: Product[]
  home: boolean
}) => {
  const {
    response: { products },
  } = await listProducts({
    countryCode: locale,
    queryParams: {
      limit: home ? 4 : undefined,
      order: "created_at",
      handle: home ? undefined : sellerProducts.map((product) => product.handle),
    },
    forceCache: !home,
  })

  if (!products.length && !sellerProducts.length) return null

  const productsToRender = sellerProducts.length ? sellerProducts : products

  return (
    <div className="w-full">
      <Carousel
        align="start"
        items={productsToRender.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={home ? "producer-forward" : "default"}
            api_product={
              home
                ? (product as HttpTypes.StoreProduct)
                : products.find((candidate) => {
                    const { cheapestPrice } = getProductPrice({
                      product: candidate,
                    })
                    return (
                      cheapestPrice &&
                      candidate.id === product.id &&
                      Boolean(cheapestPrice)
                    )
                  })
            }
          />
        ))}
      />
    </div>
  )
}
