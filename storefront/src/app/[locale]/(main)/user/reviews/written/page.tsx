import { AccountLoadingState, LoginForm, UserNavigation } from "@/components/molecules"
import { ReviewsWritten } from "@/components/organisms"
import { retrieveCustomerContext } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
import { getReviews } from "@/lib/data/reviews"

export default async function Page() {
  const { customer, isAuthenticated } = await retrieveCustomerContext()
  if (!customer) {
    if (!isAuthenticated) return <LoginForm />
    return <AccountLoadingState title="Reviews" />
  }

  const reviewsRes = await getReviews()
  const orders = await listOrders()

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <ReviewsWritten
          orders={orders.filter((order) => order.reviews.length)}
          reviews={reviewsRes.data?.reviews.filter(Boolean) ?? []}
          isError={!reviewsRes.ok}
        />
      </div>
    </main>
  )
}
