import type { Metadata } from "next"
import { retrieveCustomerContext } from "@/lib/data/customer"
import { redirect } from "next/navigation"
import { isEmpty } from "lodash"
import { Wishlist as WishlistType } from "@/types/wishlist"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { Button } from "@/components/atoms"
import { WishlistItem } from "@/components/cells"
import { getUserWishlists } from "@/lib/data/wishlist"
import { HttpTypes } from "@medusajs/types"
import { AccountLoadingState, UserNavigation } from "@/components/molecules"


export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Save products you want to revisit and purchase later.",
}

export default async function Wishlist() {
  const { customer, isAuthenticated } = await retrieveCustomerContext()

  if (!customer) {
    if (!isAuthenticated) {
      redirect("/user")
    }
    return <AccountLoadingState title="Wishlist" />
  }

  const response = await getUserWishlists()
  const wishlist: WishlistType[] = response.wishlists
  const count = wishlist?.[0]?.products?.length || 0

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <div className="md:col-span-3 space-y-8">
          {isEmpty(wishlist?.[0]?.products) ? (
            <div className="w-96 mx-auto flex flex-col items-center justify-center">
              <h2 className="heading-lg text-primary uppercase mb-2">
                Wishlist
              </h2>
              <p className="text-lg text-secondary mb-6">
                Your wishlist is currently empty.
              </p>
              <LocalizedClientLink href="/categories" className="w-full">
                <Button className="w-full">Explore</Button>
              </LocalizedClientLink>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <h2 className="heading-lg text-primary uppercase">Wishlist</h2>
              <div className="flex justify-between items-center">
                <p>{count} listings</p>
              </div>
              <div className="flex flex-wrap max-md:justify-center gap-4">
                {wishlist?.[0].products?.map((product) => (
                  <WishlistItem
                    key={product.id}
                    product={
                      product as HttpTypes.StoreProduct & {
                        calculated_amount: number
                        currency_code: string
                      }
                    }
                    wishlist={wishlist}
                    user={customer}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
