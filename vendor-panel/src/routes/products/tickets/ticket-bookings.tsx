import { Navigate } from "react-router-dom"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useAdminUser } from "../../../hooks/use-admin-user"

export const TicketBookings = () => {
  const { user, isLoading } = useAdminUser()
  const { getWidgets } = useDashboardExtension()

  if (isLoading) return null

  if (!user || user.role !== "vendor") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("ticket_booking.list.before"),
        after: getWidgets("ticket_booking.list.after"),
      }}
    >
      <p>Create events, time slots, and ticket inventory</p>
    </SingleColumnPage>
  )
}
