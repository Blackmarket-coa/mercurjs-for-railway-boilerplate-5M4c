import { Navigate } from "react-router-dom"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import { useAdminUser } from "../../../hooks/use-admin-user"

export const DigitalProducts = () => {
  const { user, isLoading } = useAdminUser()
  const { getWidgets } = useDashboardExtension()

  if (isLoading) return null

  if (!user || user.role !== "vendor") {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("digital_product.list.before"),
        after: getWidgets("digital_product.list.after"),
      }}
    >
      <p>Create and manage digital-only products</p>
    </SingleColumnPage>
  )
}
