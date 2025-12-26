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
} from "@medusajs/ui"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"
import { Venue, CreateVenueRequest } from "./types"
import { CreateVenueModal } from "../../components/create-venue-modal"

const columnHelper = createDataTableColumnHelper<Venue>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <div>
        <div className="txt-small-plus">{row.original.name}</div>
        {row.original.address && (
          <div className="txt-small text-ui-fg-subtle">
            {row.original.address}
          </div>
        )}
      </div>
    ),
  }),
  columnHelper.accessor("rows", {
    header: "Total Capacity",
    cell: ({ row }) => {
      const total = row.original.rows.reduce(
        (sum, r) => sum + r.seat_count,
        0
      )
      return <span>{total} seats</span>
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
  const [open, setOpen] = useState(false)

  const queryClient = useQueryClient()

  const offset = useMemo(
    () => pagination.pageIndex * limit,
    [pagination]
  )

  const { data, isLoading } = useQuery({
    queryKey: ["venues", offset, limit],
    queryFn: () =>
      sdk.client.fetch("/vendor/venues", {
        query: {
          offset,
          limit,
          order: "-created_at",
        },
      }),
  })

  const table = useDataTable({
    columns,
    data: data?.venues ?? [],
    rowCount: data?.count ?? 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
    getRowId: (row) => row.id,
  })

  const handleCreate = async (payload: CreateVenueRequest) => {
    await sdk.client.fetch("/vendor/venues", {
      method: "POST",
      body: payload,
    })
    queryClient.invalidateQueries({ queryKey: ["venues"] })
    setOpen(false)
  }

  return (
    <Container className="p-0 divide-y">
      <DataTable instance={table}>
        <DataTable.Toolbar>
          <DataTable.Title>Venues</DataTable.Title>
          <DataTable.Actions>
            <Button onClick={() => setOpen(true)}>
              Create Venue
            </Button>
          </DataTable.Actions>
        </DataTable.Toolbar>

        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>

      <CreateVenueModal
        open={open}
        onOpenChange={setOpen}
        onSubmit={handleCreate}
      />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Venues",
  icon: Buildings,
})

export default VenuesPage
