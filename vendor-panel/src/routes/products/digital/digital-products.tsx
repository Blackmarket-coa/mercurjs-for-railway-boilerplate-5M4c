import { Navigate } from "react-router-dom"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useAdminUser } from "../../../hooks/use-admin-user"

export const DigitalProducts = () => {
  const { user, isLoading } = useAdminUser()

  if (isLoading) return null

  if (!user || user.role !== "vendor") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <SingleColumnPage
      title="Digital Products"
      subtitle="Vendor-only digital downloads & licenses"
    >
      <p>Create and manage digital-only products</p>
    </SingleColumnPage>
  )
}
