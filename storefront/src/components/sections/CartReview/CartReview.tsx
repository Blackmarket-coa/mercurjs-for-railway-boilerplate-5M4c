"use client"

import PaymentButton from "./PaymentButton"
import { CartItems } from "./CartItems"
import { CartSummary } from "@/components/organisms"
import { TrustWidget } from "@/components/sections/TrustWidget"

const Review = ({ cart }: { cart: any }) => {
  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  // Get producer name from first cart item's seller if available
  const firstSeller = cart?.items?.[0]?.product?.seller?.name

  return (
    <div>
      <div className="w-full mb-6">
        <CartItems cart={cart} />
      </div>
      <div className="w-full mb-6 border rounded-sm p-4">
        <CartSummary
          item_total={cart?.item_subtotal || 0}
          shipping_total={cart?.shipping_subtotal || 0}
          total={cart?.total || 0}
          currency_code={cart?.currency_code || ""}
          tax={cart?.tax_total || 0}
          discount_total={cart?.discount_total || 0}
        />
      </div>

      {/* Trust Widget - Where Your Money Goes */}
      <div className="w-full mb-6">
        <TrustWidget
          cartTotal={cart?.total || 0}
          currencyCode={cart?.currency_code || "USD"}
          producerName={firstSeller}
          producerPercentage={97}
          platformPercentage={3}
        />
      </div>

      {previousStepsCompleted && (
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      )}
    </div>
  )
}

export default Review
