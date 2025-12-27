import { defineRouteConfig } from "@medusajs/admin-sdk"
import { CalendarMini } from "@medusajs/icons"
import { OrderCycleListTable } from "./components/order-cycle-list-table"

const OrderCycleListPage = () => {
  return <OrderCycleListTable />
}

export const config = defineRouteConfig({
  label: "Order Cycles",
  icon: CalendarMini,
})

export default OrderCycleListPage
