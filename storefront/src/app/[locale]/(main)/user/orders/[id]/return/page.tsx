import { AccountLoadingState } from "@/components/molecules"
import { OrderReturnSection } from "@/components/sections/OrderReturnSection/OrderReturnSection"
import { retrieveCustomerContext } from "@/lib/data/customer"
import {
  retrieveOrder,
  retrieveReturnReasons,
  retriveReturnMethods,
} from "@/lib/data/orders"
import { redirect } from "next/navigation"

export default async function ReturnOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { customer, isAuthenticated } = await retrieveCustomerContext()

  if (!customer) {
    if (!isAuthenticated) return redirect("/user")
    return <AccountLoadingState title="Return Order" />
  }

  const order = (await retrieveOrder(id)) as any
  const returnReasons = await retrieveReturnReasons()
  const returnMethods = await retriveReturnMethods(id)

  return (
    <main className="container">
      <OrderReturnSection
        order={order}
        returnReasons={returnReasons}
        shippingMethods={returnMethods as any}
      />
    </main>
  )
}
