import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ShoppingCart } from "@medusajs/icons"
import {
  Button,
  Container,
  createDataTableColumnHelper,
  DataTable,
  Heading,
  Input,
  Label,
  Select,
  Text,
  toast,
  useDataTable,
} from "@medusajs/ui"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/client"

type DemandPool = {
  id: string
  title: string
  category?: string
  committed_quantity: number
  target_quantity: number
  min_quantity: number
  status: string
  unit_of_measure?: string
}

const columnHelper = createDataTableColumnHelper<DemandPool>()

const columns = [
  columnHelper.accessor("title", {
    header: "Demand Pool",
    cell: ({ row }) => (
      <div>
        <div className="txt-small-plus">{row.original.title}</div>
        <div className="txt-small text-ui-fg-subtle">
          {row.original.category || "General"} · {row.original.status}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("committed_quantity", {
    header: "Committed",
    cell: ({ row }) => (
      <span>
        {row.original.committed_quantity}/{row.original.target_quantity}{" "}
        {row.original.unit_of_measure || "units"}
      </span>
    ),
  }),
  columnHelper.accessor("min_quantity", {
    header: "Min Qty",
  }),
]

const CollectiveDemandPoolsPage = () => {
  const queryClient = useQueryClient()
  const [selectedPoolId, setSelectedPoolId] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [minQty, setMinQty] = useState("")
  const [deliveryDays, setDeliveryDays] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["collective-demand-pools"],
    queryFn: async () => {
      const response = await sdk.client.fetch("/vendor/collective/demand-pools", {
        query: { limit: 100 },
      })
      return response as { demand_pools: DemandPool[] }
    },
  })

  const demandPools = useMemo(() => data?.demand_pools || [], [data])

  const table = useDataTable({
    columns,
    data: demandPools,
    getRowId: (row) => row.id,
    isLoading,
  })

  const submitProposal = useMutation({
    mutationFn: async () => {
      if (!selectedPoolId) {
        throw new Error("Please select a demand pool")
      }
      const parsedUnitPrice = Number(unitPrice)
      const parsedMinQty = Number(minQty)
      if (!parsedUnitPrice || !parsedMinQty) {
        throw new Error("Unit price and min quantity are required")
      }

      return sdk.client.fetch(
        `/vendor/collective/demand-pools/${selectedPoolId}/proposals`,
        {
          method: "POST",
          body: {
            unit_price: parsedUnitPrice,
            min_quantity: parsedMinQty,
            fulfillment_timeline_days: deliveryDays ? Number(deliveryDays) : undefined,
          },
        }
      )
    },
    onSuccess: () => {
      toast.success("Proposal submitted")
      setUnitPrice("")
      setMinQty("")
      setDeliveryDays("")
      queryClient.invalidateQueries({ queryKey: ["collective-demand-pools"] })
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to submit proposal")
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading>Collective Demand Pools</Heading>
        <Text className="text-ui-fg-subtle mt-1">
          Browse open demand pools and submit supplier proposals.
        </Text>
      </div>

      <DataTable instance={table}>
        <DataTable.Table />
      </DataTable>

      <div className="space-y-4 px-6 py-5">
        <Heading level="h3">Submit Proposal</Heading>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Demand Pool</Label>
            <Select value={selectedPoolId} onValueChange={setSelectedPoolId}>
              <Select.Trigger>
                <Select.Value placeholder="Select demand pool" />
              </Select.Trigger>
              <Select.Content>
                {demandPools.map((pool) => (
                  <Select.Item key={pool.id} value={pool.id}>
                    {pool.title}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Unit Price</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Minimum Quantity</Label>
            <Input
              type="number"
              min={1}
              step="1"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Fulfillment Timeline (days)</Label>
            <Input
              type="number"
              min={1}
              step="1"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={() => submitProposal.mutate()} isLoading={submitProposal.isPending}>
          Submit Proposal
        </Button>
      </div>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Collective Buys",
  icon: ShoppingCart,
})

export default CollectiveDemandPoolsPage
