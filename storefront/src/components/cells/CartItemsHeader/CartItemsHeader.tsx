import { Divider } from "@/components/atoms"
import { SingleProductSeller } from "@/types/product"
import { format } from "date-fns"
import { SellerAvatar } from "../SellerAvatar/SellerAvatar"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"

// Verified badge icon
const VerifiedBadge = () => (
  <svg className="w-4 h-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
)

export const CartItemsHeader = ({
  seller,
}: {
  seller: SingleProductSeller
}) => {
  const isProducer = seller.id !== "fleek"
  
  return (
    <div className="border rounded-sm p-4">
      <LocalizedClientLink href={`/sellers/${seller.handle}`} className="flex gap-4 items-center group">
        <SellerAvatar photo={seller.photo} size={40} alt={seller.name} />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="uppercase heading-xs group-hover:text-green-700 transition-colors">{seller.name}</p>
            {isProducer && <VerifiedBadge />}
          </div>
          {isProducer && (
            <p className="text-xs text-green-700 mt-0.5">
              You&apos;re buying directly from this producer
            </p>
          )}
        </div>

        {isProducer && seller.created_at && (
          <div className="hidden md:flex items-center gap-2 text-secondary">
            <Divider square />
            <p className="label-md">
              Since {format(seller.created_at, "MMM yyyy")}
            </p>
          </div>
        )}
      </LocalizedClientLink>
    </div>
  )
}
