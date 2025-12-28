import { Plus, PencilSquare, CubeSolid, Calendar, ArrowLeft } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  Tabs,
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { sdk } from "../../../../lib/sdk"
import {
  HarvestDTO,
  LotDTO,
  HarvestVisibility,
  HarvestVisibilityLabels,
  SeasonLabels,
  Season,
  LotGrade,
  LotGradeLabels,
  LotAllocationLabels,
} from "../../../../types/domain"

const useHarvest = (id: string) => {
  return useQuery({
    queryKey: ["farm-harvest", id],
    queryFn: async () => {
      const response = await sdk.client.fetch<{ harvest: HarvestDTO }>(
        `/vendor/farm/harvests/${id}`
      )
      return response.harvest
    },
    enabled: !!id,
  })
}

const getVisibilityBadgeColor = (status: HarvestVisibility) => {
  switch (status) {
    case HarvestVisibility.PUBLIC:
      return "green"
    case HarvestVisibility.PREVIEW:
      return "blue"
    case HarvestVisibility.DRAFT:
      return "grey"
    case HarvestVisibility.ARCHIVED:
      return "orange"
    default:
      return "grey"
  }
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

const LotRow = ({ lot }: { lot: LotDTO; harvestId: string }) => {
  const navigate = useNavigate()

  return (
    <Table.Row
      className="cursor-pointer"
      onClick={() => navigate(`/farm/lots/${lot.id}`)}
    >
      <Table.Cell>
        <Text size="small" weight="plus">
          {lot.lot_number || `Lot ${lot.id.slice(-6)}`}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Badge color={getLotGradeBadgeColor(lot.grade)} size="small">
          {LotGradeLabels[lot.grade] || lot.grade}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">
          {lot.quantity_available} / {lot.quantity_total} {lot.unit}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Badge color="grey" size="small">
          {LotAllocationLabels[lot.allocation_type] || lot.allocation_type}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">
          {lot.best_by_date
            ? new Date(lot.best_by_date).toLocaleDateString()
            : "-"}
        </Text>
      </Table.Cell>
      <Table.Cell>
        {lot.surplus_flag ? (
          <Badge color="orange" size="small">
            Surplus
          </Badge>
        ) : lot.is_active ? (
          <Badge color="green" size="small">
            Active
          </Badge>
        ) : (
          <Badge color="grey" size="small">
            Inactive
          </Badge>
        )}
      </Table.Cell>
    </Table.Row>
  )
}

const HarvestDetailPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: harvest, isLoading, isError } = useHarvest(id!)

  if (isLoading) {
    return (
      <Container className="p-6">
        <Text>Loading harvest...</Text>
      </Container>
    )
  }

  if (isError || !harvest) {
    return (
      <Container className="p-6">
        <Text className="text-ui-fg-error">Failed to load harvest</Text>
        <Button variant="secondary" onClick={() => navigate("/farm/harvests")}>
          Back to Harvests
        </Button>
      </Container>
    )
  }

  const lots = harvest.lots || []

  return (
    <div className="flex flex-col gap-y-4">
      {/* Header */}
      <Container className="p-0">
        <div className="flex items-center gap-2 px-6 py-3 border-b">
          <Button
            variant="transparent"
            size="small"
            onClick={() => navigate("/farm/harvests")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Text className="text-ui-fg-subtle">Back to Harvests</Text>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-4">
            {harvest.photo && (
              <img
                src={harvest.photo}
                alt={harvest.crop_name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <Heading level="h1">{harvest.crop_name}</Heading>
                {harvest.variety && (
                  <Text className="text-ui-fg-subtle">({harvest.variety})</Text>
                )}
                <Badge
                  color={getVisibilityBadgeColor(harvest.visibility_status)}
                  size="small"
                >
                  {HarvestVisibilityLabels[harvest.visibility_status]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <Text className="text-ui-fg-subtle text-sm">
                  {SeasonLabels[harvest.season as Season]} {harvest.year}
                </Text>
                {harvest.harvest_date && (
                  <Text className="text-ui-fg-subtle text-sm">
                    • Harvested {new Date(harvest.harvest_date).toLocaleDateString()}
                  </Text>
                )}
                {harvest.field_name && (
                  <Text className="text-ui-fg-subtle text-sm">
                    • {harvest.field_name}
                  </Text>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(`/farm/harvests/${id}/lots/create`)}
            >
              <Plus className="mr-2" />
              Add Lot
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(`/farm/harvests/${id}/edit`)}
            >
              <PencilSquare className="mr-2" />
              Edit
            </Button>
          </div>
        </div>

        {/* Yield Info */}
        {harvest.expected_yield_quantity && (
          <div className="grid grid-cols-4 gap-4 px-6 py-4">
            <div className="flex flex-col">
              <Text className="text-ui-fg-subtle text-sm">Expected Yield</Text>
              <Text className="text-lg font-semibold">
                {harvest.expected_yield_quantity} {harvest.expected_yield_unit}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text className="text-ui-fg-subtle text-sm">Total Lots</Text>
              <Text className="text-lg font-semibold">{lots.length}</Text>
            </div>
            <div className="flex flex-col">
              <Text className="text-ui-fg-subtle text-sm">Available</Text>
              <Text className="text-lg font-semibold">
                {lots.reduce((sum, lot) => sum + lot.quantity_available, 0)}{" "}
                {harvest.expected_yield_unit || "units"}
              </Text>
            </div>
            <div className="flex flex-col">
              <Text className="text-ui-fg-subtle text-sm">Sold</Text>
              <Text className="text-lg font-semibold">
                {lots.reduce((sum, lot) => sum + lot.quantity_sold, 0)}{" "}
                {harvest.expected_yield_unit || "units"}
              </Text>
            </div>
          </div>
        )}
      </Container>

      {/* Tabs */}
      <Container className="p-0">
        <Tabs defaultValue="lots">
          <Tabs.List className="px-6">
            <Tabs.Trigger value="lots">
              <CubeSolid className="w-4 h-4 mr-2" />
              Lots ({lots.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="details">Details</Tabs.Trigger>
            <Tabs.Trigger value="availability">
              <Calendar className="w-4 h-4 mr-2" />
              Availability
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="lots" className="p-0">
            {lots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-y-4">
                <CubeSolid className="w-12 h-12 text-ui-fg-muted" />
                <Text className="text-ui-fg-subtle">No lots created yet</Text>
                <Text className="text-ui-fg-subtle text-sm max-w-md text-center">
                  Lots help you track batches of produce from this harvest with
                  different grades, quantities, and availability.
                </Text>
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/farm/harvests/${id}/lots/create`)}
                >
                  Create First Lot
                </Button>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Lot #</Table.HeaderCell>
                    <Table.HeaderCell>Grade</Table.HeaderCell>
                    <Table.HeaderCell>Available / Total</Table.HeaderCell>
                    <Table.HeaderCell>Allocation</Table.HeaderCell>
                    <Table.HeaderCell>Best By</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {lots.map((lot) => (
                    <LotRow key={lot.id} lot={lot} harvestId={harvest.id} />
                  ))}
                </Table.Body>
              </Table>
            )}
          </Tabs.Content>

          <Tabs.Content value="details" className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {harvest.growing_method && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Growing Method</Text>
                  <Text>{harvest.growing_method}</Text>
                </div>
              )}
              {harvest.category && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Category</Text>
                  <Text>{harvest.category}</Text>
                </div>
              )}
              {harvest.planted_date && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Planted Date</Text>
                  <Text>{new Date(harvest.planted_date).toLocaleDateString()}</Text>
                </div>
              )}
              {harvest.farmer_notes && (
                <div className="col-span-2">
                  <Text className="text-ui-fg-subtle text-sm">Farmer Notes</Text>
                  <Text className="whitespace-pre-wrap">{harvest.farmer_notes}</Text>
                </div>
              )}
              {harvest.weather_notes && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Weather Notes</Text>
                  <Text className="whitespace-pre-wrap">{harvest.weather_notes}</Text>
                </div>
              )}
              {harvest.taste_notes && (
                <div>
                  <Text className="text-ui-fg-subtle text-sm">Taste Notes</Text>
                  <Text className="whitespace-pre-wrap">{harvest.taste_notes}</Text>
                </div>
              )}
              {harvest.usage_tips && (
                <div className="col-span-2">
                  <Text className="text-ui-fg-subtle text-sm">Usage Tips</Text>
                  <Text className="whitespace-pre-wrap">{harvest.usage_tips}</Text>
                </div>
              )}
            </div>
          </Tabs.Content>

          <Tabs.Content value="availability" className="p-6">
            <div className="flex flex-col items-center justify-center py-10 gap-y-4">
              <Calendar className="w-12 h-12 text-ui-fg-muted" />
              <Text className="text-ui-fg-subtle">
                Create lots first, then add availability windows
              </Text>
              <Text className="text-ui-fg-subtle text-sm max-w-md text-center">
                Availability windows control when and how your products are
                available for purchase.
              </Text>
            </div>
          </Tabs.Content>
        </Tabs>
      </Container>
    </div>
  )
}

export default HarvestDetailPage
