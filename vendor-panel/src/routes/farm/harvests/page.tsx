import { Plus, EllipsisHorizontal, PencilSquare, Trash, Eye, Sun, InformationCircle, LightBulb } from "@medusajs/icons"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Table,
  DropdownMenu,
  IconButton,
  usePrompt,
  toast,
  Tooltip,
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { sdk } from "../../../lib/sdk"
import {
  HarvestDTO,
  HarvestVisibility,
  HarvestVisibilityLabels,
  SeasonLabels,
  Season,
}from "../../../types/domain"

// Helpful info for users
const HARVEST_HELP = {
  title: "What is a Harvest?",
  description: "A harvest represents a single crop picking event. Each harvest can have multiple lots - individual batches with their own grades and quantities.",
  examples: [
    "Spring Tomatoes 2025",
    "Early Season Lettuce",
    "Weekly Herb Harvest"
  ]
}

const useHarvests = () => {
  return useQuery({
    queryKey: ["farm-harvests"],
    queryFn: async () => {
      const response = await sdk.client.fetch<{
        harvests: HarvestDTO[]
        count: number
      }>("/vendor/farm/harvests", {
        query: {
          limit: 50,
          offset: 0,
        },
      })
      return response
    },
  })
}

const useDeleteHarvest = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch(`/vendor/farm/harvests/${id}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-harvests"] })
    },
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

const HarvestRow = ({ harvest }: { harvest: HarvestDTO }) => {
  const navigate = useNavigate()
  const prompt = usePrompt()
  const deleteHarvest = useDeleteHarvest()

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Delete Harvest",
      description: `Are you sure you want to delete "${harvest.crop_name}"? This will also delete all associated lots. This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await deleteHarvest.mutateAsync(harvest.id)
        toast.success("Harvest deleted successfully")
      } catch {
        toast.error("Failed to delete harvest")
      }
    }
  }

  return (
    <Table.Row
      className="cursor-pointer"
      onClick={() => navigate(`/farm/harvests/${harvest.id}`)}
    >
      <Table.Cell>
        <div className="flex items-center gap-x-3">
          {harvest.photo && (
            <img
              src={harvest.photo}
              alt={harvest.crop_name}
              className="h-10 w-10 rounded-md object-cover"
            />
          )}
          <div>
            <Text size="small" weight="plus">
              {harvest.crop_name}
            </Text>
            {harvest.variety && (
              <Text size="xsmall" className="text-ui-fg-subtle">
                {harvest.variety}
              </Text>
            )}
          </div>
        </div>
      </Table.Cell>
      <Table.Cell>
        <Badge color="grey" size="small">
          {SeasonLabels[harvest.season as Season] || harvest.season}
        </Badge>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">{harvest.year}</Text>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">
          {harvest.harvest_date
            ? new Date(harvest.harvest_date).toLocaleDateString()
            : "-"}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">{harvest.lots?.length ?? 0} lots</Text>
      </Table.Cell>
      <Table.Cell>
        <Badge
          color={getVisibilityBadgeColor(harvest.visibility_status)}
          size="small"
        >
          {HarvestVisibilityLabels[harvest.visibility_status] ||
            harvest.visibility_status}
        </Badge>
      </Table.Cell>
      <Table.Cell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <IconButton variant="transparent" size="small">
              <EllipsisHorizontal />
            </IconButton>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onClick={() => navigate(`/farm/harvests/${harvest.id}`)}
            >
              <Eye className="mr-2" />
              View Details
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => navigate(`/farm/harvests/${harvest.id}/edit`)}
            >
              <PencilSquare className="mr-2" />
              Edit Harvest
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onClick={() => navigate(`/farm/harvests/${harvest.id}/lots/create`)}
            >
              <Plus className="mr-2" />
              Add Lot
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onClick={handleDelete} className="text-ui-fg-error">
              <Trash className="mr-2" />
              Delete Harvest
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Table.Cell>
    </Table.Row>
  )
}

const HarvestListPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useHarvests()
  const [showHelp, setShowHelp] = useState(true)
  const harvests = data?.harvests || []

  return (
    <div className="flex flex-col gap-y-4">
      {/* Help Banner - Dismissible */}
      {showHelp && harvests.length < 3 && (
        <Container className="p-4 bg-blue-50 border border-blue-200">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <InformationCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <Text className="font-medium text-blue-800">{HARVEST_HELP.title}</Text>
                <Text className="text-blue-700 text-sm mt-1">{HARVEST_HELP.description}</Text>
                <div className="flex items-center gap-2 mt-2">
                  <Text className="text-blue-600 text-sm">Examples:</Text>
                  {HARVEST_HELP.examples.map((ex, i) => (
                    <Badge key={i} color="blue" size="xsmall">{ex}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <Button 
              variant="transparent" 
              size="small"
              onClick={() => setShowHelp(false)}
            >
              Got it
            </Button>
          </div>
        </Container>
      )}

      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Heading level="h1">Harvests</Heading>
              <Tooltip content="A harvest is a single crop picking event. Create lots from each harvest to track inventory.">
                <InformationCircle className="w-4 h-4 text-ui-fg-muted cursor-help" />
              </Tooltip>
            </div>
            <Text className="text-ui-fg-subtle">
              Track and manage your crop harvests
            </Text>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/farm/harvests/create")}
          >
            <Plus className="mr-2" />
            Log Harvest
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ui-fg-base"></div>
              <Text className="text-ui-fg-subtle">Loading harvests...</Text>
            </div>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-10 gap-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <Text className="text-red-600">!</Text>
            </div>
            <Text className="text-ui-fg-error">Failed to load harvests</Text>
            <Text className="text-ui-fg-subtle text-sm">Please try refreshing the page</Text>
            <Button variant="secondary" size="small" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        ) : harvests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
              <Sun className="w-10 h-10 text-green-600" />
            </div>
            <Heading level="h2" className="text-ui-fg-base">No harvests logged yet</Heading>
            <Text className="text-ui-fg-subtle text-center max-w-md">
              Start by logging your first harvest. You'll be able to track quantities, 
              add photos, and create lots for inventory management.
            </Text>
            
            {/* Step by step guide */}
            <div className="bg-ui-bg-subtle rounded-lg p-6 max-w-md w-full mt-4">
              <Text className="font-medium mb-3 flex items-center gap-2">
                <LightBulb className="w-4 h-4 text-amber-500" />
                How harvests work
              </Text>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <Text className="font-medium text-sm">Log your harvest</Text>
                    <Text className="text-ui-fg-subtle text-sm">Record crop name, variety, date, and notes</Text>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <Text className="font-medium text-sm">Create lots</Text>
                    <Text className="text-ui-fg-subtle text-sm">Break into batches with grades and quantities</Text>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <Text className="font-medium text-sm">Link to products</Text>
                    <Text className="text-ui-fg-subtle text-sm">Connect lots to store products for sale</Text>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              className="mt-2"
              onClick={() => navigate("/farm/harvests/create")}
            >
              <Sun className="w-4 h-4 mr-2" />
              Log Your First Harvest
            </Button>
          </div>
        ) : (
          <>
            {/* Quick tip when user has few harvests */}
            {harvests.length < 3 && (
              <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <LightBulb className="w-4 h-4 text-amber-600" />
                  <Text className="text-amber-800 text-sm">
                    <strong>Tip:</strong> Click on any harvest to view details or add lots
                  </Text>
                </div>
              </div>
            )}
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Crop</Table.HeaderCell>
                  <Table.HeaderCell>Season</Table.HeaderCell>
                  <Table.HeaderCell>Year</Table.HeaderCell>
                  <Table.HeaderCell>Harvest Date</Table.HeaderCell>
                  <Table.HeaderCell>
                    <Tooltip content="Number of inventory lots created from this harvest">
                      <span className="cursor-help">Lots</span>
                    </Tooltip>
                  </Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell className="w-[1%]"></Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {harvests.map((harvest) => (
                  <HarvestRow key={harvest.id} harvest={harvest} />
                ))}
              </Table.Body>
            </Table>
          </>
        )}
      </Container>
    </div>
  )
}

export default HarvestListPage
