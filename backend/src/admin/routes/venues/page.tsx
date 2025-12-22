import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import { 
  createDataTableColumnHelper, 
  Container, 
  DataTable, 
  useDataTable, 
  Heading, 
  DataTablePaginationState,
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { sdk } from "../../lib/sdk"
import { Venue, CreateVenueRequest } from "../../types"

const VenuesPage = () => {
  // TODO implement component
}

export const config = defineRouteConfig({
  label: "Venues",
  icon: Buildings,
})

export default VenuesPage
