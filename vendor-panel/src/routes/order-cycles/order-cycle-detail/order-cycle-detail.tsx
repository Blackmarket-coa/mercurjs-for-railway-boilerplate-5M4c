import { useParams } from "react-router-dom"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { OrderCycleGeneralSection } from "./components/order-cycle-general-section"
import { OrderCycleProductsSection } from "./components/order-cycle-products-section"
import { useOrderCycle } from "../../../hooks/api/order-cycles"
import { Container, Text } from "@medusajs/ui"

export const OrderCycleDetail = () => {
  const { id } = useParams<{ id: string }>()
  const { getWidgets } = useDashboardExtension()
  const { data, isLoading, error } = useOrderCycle(id!)

  if (isLoading) {
    return (
      <SingleColumnPage>
        <Container className="flex items-center justify-center py-12">
          <Text className="text-ui-fg-subtle">Loading...</Text>
        </Container>
      </SingleColumnPage>
    )
  }

  if (error || !data?.order_cycle) {
    return (
      <SingleColumnPage>
        <Container className="flex items-center justify-center py-12">
          <Text className="text-ui-fg-error">Order cycle not found</Text>
        </Container>
      </SingleColumnPage>
    )
  }

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("order_cycle.detail.after"),
        before: getWidgets("order_cycle.detail.before"),
      }}
    >
      <div className="flex flex-col gap-y-4">
        <OrderCycleGeneralSection orderCycle={data.order_cycle} />
        <OrderCycleProductsSection orderCycle={data.order_cycle} />
      </div>
    </SingleColumnPage>
  )
}
