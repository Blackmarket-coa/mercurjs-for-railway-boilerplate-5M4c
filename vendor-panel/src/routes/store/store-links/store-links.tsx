import { Heading } from "@medusajs/ui"
import { useTranslation } from "react-i18next"
import { RouteDrawer } from "../../../components/modals"
import { EditLinksForm } from "./components/edit-links-form"
import { useMe } from "../../../hooks/api"

export const StoreLinks = () => {
  const { t } = useTranslation()
  const { seller, isPending: isLoading, isError, error } = useMe()

  if (isError) {
    throw error
  }

  const ready = !!seller && !isLoading

  return (
    <RouteDrawer>
      <RouteDrawer.Header>
        <Heading>Social Media & Storefronts</Heading>
      </RouteDrawer.Header>
      {ready && <EditLinksForm seller={seller} />}
    </RouteDrawer>
  )
}

export const Component = StoreLinks
