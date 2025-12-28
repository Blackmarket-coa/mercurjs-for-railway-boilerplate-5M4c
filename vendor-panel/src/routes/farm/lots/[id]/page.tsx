import { ArrowLeft, PencilSquare, Calendar, Plus, Trash, Tag } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Tabs,
  usePrompt,
  toast,
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { sdk } from "../../../../lib/sdk"
import {
  LotDTO,
  AvailabilityWindowDTO,
  LotGrade,
  LotGradeLabels,
  LotAllocationLabels,
  SalesChannelLabels,
  PricingStrategyLabels,
} from "../../../../types/domain"

const useLot = (id: string) => {
  return useQuery({
    queryKey: ["farm-lot", id],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ lot: LotDTO }>(
        `/vendor/farm/lots/${id}`
      )
      return response.lot
    },
    enabled: !!id,
  })
}

const useDeleteLot = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/vendor/farm/lots/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-lots"] })
      queryClient.invalidateQueries({ queryKey: ["farm-harvests"] })
    },
  })
}

const useMarkSurplus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      await sdk.client.fetch(`/vendor/farm/lots/${id}/surplus`, {
        method: "POST",
        body: { reason },
      })
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["farm-lot", id] })
    },
  })
}

const getLotGradeBadgeColor = (grade: LotGrade) => {
  switch (grade) {
    case LotGrade.PREMIUM:
      return "purple"
    case LotGrade.GRADE_A:
      return "green"
    case LotGrade.GRADE_B:
      return "blue"
    case LotGrade.PROCESSING:
      return "orange"
    case LotGrade.IMPERFECT:
      return "grey"
    case LotGrade.SECONDS:
      return "grey"
    default:
      return "grey"
  }
}

const AvailabilityRow = ({ window: aw }: { window: AvailabilityWindowDTO }) => {
  const navigate = useNavigate()

  return (
    <Table.Row
      className="cursor-pointer"
      onClick={() => navigate(`/farm/availability/${aw.id}`)}
    >
      <Table.Cell>
        <Badge color="grey" size="small">
          {SalesChannelLabels[aw.sales_channel] || aw.sales_channel}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">
          ${aw.unit_price.toFixed(2)} / unit
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Badge color="grey" size="small">
          {PricingStrategyLabels[aw.pricing_strategy] || aw.pricing_strategy}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">
          {new Date(aw.available_from).toLocaleDateString()}
          {aw.available_until && (
            <> - {new Date(aw.available_until).toLocaleDateString()}</>
          )}
        </Text>
      </Table.Cell>
      <Table.Cell>
        {aw.is_active ? (
          <Badge color="green" size="small">Active</Badge>
        ) : aw.paused_at ? (
          <Badge color="orange" size="small">Paused</Badge>
        ) : (
          <Badge color="grey" size="small">Inactive</Badge>
        )}
      </Table.Cell>
    </Table.Row>
  )
}

const LotDetailPage = () => {
  const navigate = useNavigate()
  const prompt = usePrompt()
  const { id } = useParams<{ id: string }>()
  const { data: lot, isLoading, isError } = useLot(id!)
  const deleteLot = useDeleteLot()
  const markSurplus = useMarkSurplus()

  const handleDelete = async () => {
    if (!lot) return

    const confirmed = await prompt({
      title: "Delete Lot",
      description: `Are you sure you want to delete lot "${lot.lot_number || lot.id}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await deleteLot.mutateAsync(lot.id)
        toast.success("Lot deleted")
        navigate(`/farm/harvests/${lot.harvest_id}`)
      } catch {
        toast.error("Failed to delete lot")
      }
    }
  }

  const handleMarkSurplus = async () => {
    if (!lot) return

    const confirmed = await prompt({
      title: "Mark as Surplus",
      description: "This will flag this lot as surplus inventory, which can enable special pricing. Continue?",
      confirmText: "Mark Surplus",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await markSurplus.mutateAsync({ id: lot.id, reason: "Excess inventory" })
        toast.success("Lot marked as surplus")
      } catch {
        toast.error("Failed to mark surplus")
      }
    }
  }

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading lot...</Text>
      </Container>
    )
  }

  if (isError || !lot) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">Failed to load lot</Text>
        <Button variant="secondary" onClick={() => navigate("/farm/harvests")}>
          Back to Harvests
        </Button>
      </Container>
    )
  }

  const availabilityWindows = lot.availability_windows || []
  const utilizationPercent = lot.quantity_total > 0
    ? Math.round(((lot.quantity_sold + lot.quantity_reserved) / lot.quantity_total) * 100)
    : 0

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="p-0">
        <div className="flex items-center gap-2 px-6 py-3 border-b">
          <Button
            variant="transparent"
            size="small"
            onClick={() => navigate(`/farm/harvests/${lot.harvest_id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Text className="text-ui-fg-subtle">Back to Harvest</Text>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h1">
                {lot.lot_number || `Lot ${lot.id.slice(-6)}`}
              </Heading>
              <Badge color={getLotGradeBadgeColor(lot.grade)} size="small">
                {LotGradeLabels[lot.grade]}
              </Badge>
              {lot.surplus_flag && (
                <Badge color="orange" size="small">Surplus</Badge>
              )}
              {!lot.is_active && (
                <Badge color="grey" size="small">Inactive</Badge>
              )}
            </div>
            <Text className="text-ui-fg-subtle mt-1">
              {LotAllocationLabels[lot.allocation_type]}
              {lot.size_class && ` • ${lot.size_class}`}
              {lot.batch_date && ` • Batch ${new Date(lot.batch_date).toLocaleDateString()}`}
            </Text>
          </div>
          <div className="flex gap-2">
            {!lot.surplus_flag && (
              <Button variant="secondary" onClick={handleMarkSurplus}>
                <Tag className="mr-2" />
                Mark Surplus
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => navigate(`/farm/lots/${id}/availability/create`)}
            >
              <Plus className="mr-2" />
              Add Availability
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/farm/lots/${id}/edit`)}
            >
              <PencilSquare className="mr-2" />
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              <Trash className="mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 p-6">
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Total Quantity</Text>
            <Text className="text-xl font-semibold">
              {lot.quantity_total} {lot.unit}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Available</Text>
            <Text className="text-xl font-semibold text-green-600">
              {lot.quantity_available} {lot.unit}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Reserved</Text>
            <Text className="text-xl font-semibold text-blue-600">
              {lot.quantity_reserved} {lot.unit}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Sold</Text>
            <Text className="text-xl font-semibold">
              {lot.quantity_sold} {lot.unit}
            </Text>
          </div>
          <div className="flex flex-col">
            <Text className="text-ui-fg-subtle text-sm">Utilization</Text>
            <Text className="text-xl font-semibold">{utilizationPercent}%</Text>
          </div>
        </div>
      </Container>

      {/* Tabs */}
      <Container className="p-0">
        <Tabs defaultValue="availability">
          <Tabs.List className="px-6">
            <Tabs.Trigger value="availability">
              <Calendar className="w-4 h-4 mr-2" />
              Availability ({availabilityWindows.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="pricing">Pricing</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="availability" className="p-0">
            {availabilityWindows.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-y-4">
                <Calendar className="w-12 h-12 text-ui-fg-muted" />
                <Text className="text-ui-fg-subtle">No availability windows</Text>
                <Text className="text-ui-fg-subtle text-sm max-w-md text-center">
                  Create availability windows to make this lot purchasable through
                  different sales channels.
                </Text>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/farm/lots/${id}/availability/create`)}
                >
                  Create Availability Window
                </Button>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Channel</Table.HeaderCell>
                    <Table.HeaderCell>Price</Table.HeaderCell>
                    <Table.HeaderCell>Strategy</Table.HeaderCell>
                    <Table.HeaderCell>Dates</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {availabilityWindows.map((aw) => (
                    <AvailabilityRow key={aw.id} window={aw} />
                  ))}
                </Table.Body>
              </Table>
            )}
          </Tabs.Content>

          <Tabs.Content value="details" className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {lot.external_lot_id && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">External Lot ID</Text>
                  <Text>{lot.external_lot_id}</Text>
                </div>
              )}
              {lot.storage_location && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Storage Location</Text>
                  <Text>{lot.storage_location}</Text>
                </div>
              )}
              {lot.storage_requirements && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Storage Requirements</Text>
                  <Text>{lot.storage_requirements}</Text>
                </div>
              )}
              {lot.best_by_date && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Best By Date</Text>
                  <Text>{new Date(lot.best_by_date).toLocaleDateString()}</Text>
                </div>
              )}
              {lot.use_by_date && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Use By Date</Text>
                  <Text>{new Date(lot.use_by_date).toLocaleDateString()}</Text>
                </div>
              )}
              {lot.surplus_flag && lot.surplus_reason && (
                <div className="col-span-2">
                  <Text className="text-ui-fg-subtle text-sm">Surplus Reason</Text>
                  <Text>{lot.surplus_reason}</Text>
                </div>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="pricing" className="p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Text className="text-ui-fg-subtle text-sm">Suggested Price</Text>
                <Text className="text-xl font-semibold">
                  {lot.suggested_price_per_unit
                    ? `$${lot.suggested_price_per_unit.toFixed(2)} / ${lot.unit}`
                    : "-"}
                </Text>
              </div>
              <div>
                <Text className="text-ui-fg-subtle text-sm">Cost (Internal)</Text>
                <Text className="text-xl font-semibold">
                  {lot.cost_per_unit
                    ? `$${lot.cost_per_unit.toFixed(2)} / ${lot.unit}`
                    : "-"}
                </Text>
              </div>
              {lot.suggested_price_per_unit && lot.cost_per_unit && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Margin</Text>
                  <Text className="text-xl font-semibold">
                    {Math.round(
                      ((lot.suggested_price_per_unit - lot.cost_per_unit) /
                        lot.suggested_price_per_unit) *
                        100
                    )}
                    %
                  </Text>
                </div>
              )}
            </div>
          </Tabs.Content>
        </Tabs>
      </Container>
    </div>
  )
}

export default LotDetailPage
