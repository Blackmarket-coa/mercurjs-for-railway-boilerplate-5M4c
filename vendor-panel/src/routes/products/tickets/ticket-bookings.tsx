import { Navigate } from "react-router-dom"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useAdminUser } from "../../../hooks/use-admin-user"

export const TicketBookings = () => {
  const { user, isLoading } = useAdminUser()

  if (isLoading) return null

  if (!user || user.role !== "vendor") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <SingleColumnPage
      title="Ticket Bookings"
      subtitle="Events, reservations, and capacity-based products"
    >
      <p>Create events, time slots, and ticket inventory</p>
    </SingleColumnPage>
  )
}
