import { useParams } from "react-router-dom"
import { Container, Text } from "@medusajs/ui"
import { OrderCycleGeneralSection } from "./components/order-cycle-general-section"
import { OrderCycleProductsSection } from "./components/order-cycle-products-section"
import { useOrderCycle } from "../../../hooks/api/order-cycles"

const OrderCycleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, error } = useOrderCycle(id!)

  if (isLoading) {
    return (
      <Container className="flex items-center justify-center py-12">
        <Text className="text-ui-fg-subtle">Loading...</Text>
      </Container>
    )
  }

  if (error || !data?.order_cycle) {
    return (
      <Container className="flex items-center justify-center py-12">
        <Text className="text-ui-fg-error">Order cycle not found</Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <OrderCycleGeneralSection orderCycle={data.order_cycle} />
      <OrderCycleProductsSection orderCycle={data.order_cycle} />
    </div>
  )
}

export default OrderCycleDetailPage
