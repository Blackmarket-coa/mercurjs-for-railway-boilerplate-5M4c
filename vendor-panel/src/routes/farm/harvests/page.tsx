import { Plus, EllipsisHorizontal, PencilSquare, Trash, Eye, Sun } from "@medusajs/icons"
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
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import {
  HarvestDTO,
  HarvestVisibility,
  HarvestVisibilityLabels,
  SeasonLabels,
  Season,
} from "../../../types/domain"

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
  const harvests = data?.harvests || []

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading level="h1">Harvests</Heading>
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
            <Text className="text-ui-fg-subtle">Loading harvests...</Text>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-10">
            <Text className="text-ui-fg-error">Failed to load harvests</Text>
          </div>
        ) : harvests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-y-4">
            <Sun className="w-12 h-12 text-ui-fg-muted" />
            <Text className="text-ui-fg-subtle">No harvests logged yet</Text>
            <Button
              variant="secondary"
              onClick={() => navigate("/farm/harvests/create")}
            >
              Log your first harvest
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Crop</Table.HeaderCell>
                <Table.HeaderCell>Season</Table.HeaderCell>
                <Table.HeaderCell>Year</Table.HeaderCell>
                <Table.HeaderCell>Harvest Date</Table.HeaderCell>
                <Table.HeaderCell>Lots</Table.HeaderCell>
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
        )}
      </Container>
    </div>
  )
}

export default HarvestListPage
