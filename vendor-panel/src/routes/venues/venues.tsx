// src/routes/venues/venues.tsx
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Buildings } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  DataTablePaginationState,
  Button,
  Text,
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { sdk } from "../../lib/sdk"
import { Venue, CreateVenueRequest } from "./types"
import { CreateVenueModal } from "./components/create-venue-modal"

const columnHelper = createDataTableColumnHelper<Venue>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="txt-small-plus">{row.original.name}</div>
        {row.original.address && (
          <div className="txt-small text-ui-fg-subtle">{row.original.address}</div>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("rows", {
    header: "Total Capacity",
    cell: ({ row }) => {
      const totalSeats = row.original.rows.reduce((sum, r) => sum + r.seat_count, 0)
      return <span>{totalSeats} seats</span>
    },
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: ({ row }) => row.original.address || "-",
  }),
]

const VenuesPage = () => {
  const limit = 15
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageIndex: 0,
    pageSize: limit,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const offset = useMemo(() => pagination.pageIndex * limit, [pagination])

  const { data, isLoading } = useQuery({
    queryKey: ["venues", offset, limit],
    queryFn: () =>
      sdk.client.fetch("/admin/venues", {
        query: { offset, limit, order: "-created_at" },
      }),
  })

  const table = useDataTable({
    columns,
    data: data?.venues || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  const handleCreateVenue = async (payload: CreateVenueRequest) => {
    try {
      await sdk.client.fetch("/admin/venues", {
        method: "POST",
        body: payload,
      })
      queryClient.invalidateQueries({ queryKey: ["venues"] })
      setIsModalOpen(false)
    } catch (error: any) {
      console.error("Failed to create venue:", error.message)
    }
  }

  return (
    <Container className="divide-y p-0">
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <Heading>Venues</Heading>
          <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
            Create Venue
          </Button>
        </DataTable.Toolbar>

        {data?.venues.length === 0 && !isLoading ? (
          <div className="text-center py-8">
            <Buildings className="mx-auto h-12 w-12 text-ui-fg-subtle mb-4" />
            <Heading level="h3">No venues yet</Heading>
            <Text className="text-ui-fg-subtle">
              Click "Create Venue" to add your first venue
            </Text>
          </div>
        ) : (
          <>
            <DataTable.Table />
            <DataTable.Pagination />
          </>
        )}
      </DataTable>

      <CreateVenueModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleCreateVenue}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Venues",
  icon: Buildings,
})

export default VenuesPage
