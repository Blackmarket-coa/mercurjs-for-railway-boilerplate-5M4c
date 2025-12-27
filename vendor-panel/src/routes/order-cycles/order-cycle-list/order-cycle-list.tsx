import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { OrderCycleListTable } from "./components/order-cycle-list-table"

export const OrderCycleList = () => {
  const { getWidgets } = useDashboardExtension()

  return (
    <SingleColumnPage
      widgets={{
        after: getWidgets("order_cycle.list.after"),
        before: getWidgets("order_cycle.list.before"),
      }}
    >
      <OrderCycleListTable />
    </SingleColumnPage>
  )
}
