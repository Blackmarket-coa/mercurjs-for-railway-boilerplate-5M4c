import { AccountLoadingState, LoginForm, UserNavigation } from "@/components/molecules"
import { ReviewsToWrite } from "@/components/organisms"
import { retrieveCustomerContext } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"

export default async function Page() {
  const { customer, isAuthenticated } = await retrieveCustomerContext()

  if (!customer) {
    if (!isAuthenticated) return <LoginForm />
    return <AccountLoadingState title="Reviews" />
  }

  const orders = await listOrders()

  if (!orders) return null

  return (
    <main className="container">
      <div className="grid grid-cols-1 md:grid-cols-4 mt-6 gap-5 md:gap-8">
        <UserNavigation />
        <ReviewsToWrite
          orders={orders.filter((order) => order.reviews.length === 0)}
        />
      </div>
    </main>
  )
}
