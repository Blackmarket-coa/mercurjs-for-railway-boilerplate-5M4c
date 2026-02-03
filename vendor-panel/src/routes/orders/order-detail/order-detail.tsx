import { useLoaderData, useParams } from "react-router-dom"
import { useMemo } from "react"

import { TwoColumnPageSkeleton } from "../../../components/common/skeleton"
import { TwoColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useOrder } from "../../../hooks/api/orders"
import { OrderCustomerSection } from "./components/order-customer-section"
import { OrderFulfillmentSection } from "./components/order-fulfillment-section"
import { OrderGeneralSection } from "./components/order-general-section"
import { OrderPaymentSection } from "./components/order-payment-section"
import { OrderSummarySection } from "./components/order-summary-section"
import { OrderActivitySection } from "./components/order-activity-section/order-activity-section"
import { DEFAULT_FIELDS } from "./constants"
import { orderLoader } from "./loader"

export const OrderDetail = () => {
  const initialData = useLoaderData() as Awaited<ReturnType<typeof orderLoader>>

  const { id } = useParams()
  const { getWidgets } = useDashboardExtension()

  const { order, isLoading, isError, error } = useOrder(
    id!,
    {
      fields: DEFAULT_FIELDS,
    },
    {
      initialData,
    }
  )

  const sortedOrder = useMemo(() => {
    if (!order) {
      return order
    }

    return {
      ...order,
      items: [...order.items].sort((itemA: any, itemB: any) => {
        if (itemA.created_at > itemB.created_at) {
          return 1
        }

        if (itemA.created_at < itemB.created_at) {
          return -1
        }

        return 0
      }),
    }
  }, [order])

  if (isLoading || !sortedOrder) {
    return (
      <TwoColumnPageSkeleton mainSections={4} sidebarSections={2} showJSON />
    )
  }

  if (isError) {
    throw error
  }

  return (
    <TwoColumnPage
      widgets={{
        after: getWidgets("order.details.after"),
        before: getWidgets("order.details.before"),
        sideAfter: getWidgets("order.details.side.after"),
        sideBefore: getWidgets("order.details.side.before"),
      }}
      data={sortedOrder}
      hasOutlet
    >
      <TwoColumnPage.Main>
        <OrderGeneralSection order={sortedOrder} />
        <OrderSummarySection order={sortedOrder} />
        <OrderPaymentSection order={sortedOrder} />
        <OrderFulfillmentSection order={sortedOrder} />
      </TwoColumnPage.Main>
      <TwoColumnPage.Sidebar>
        <OrderCustomerSection order={sortedOrder} />
        <OrderActivitySection order={sortedOrder} />
      </TwoColumnPage.Sidebar>
    </TwoColumnPage>
  )
}
