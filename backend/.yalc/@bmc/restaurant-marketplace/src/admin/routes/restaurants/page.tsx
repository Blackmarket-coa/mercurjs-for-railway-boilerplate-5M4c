import { defineRouteConfig } from "@medusajs/admin-sdk"
import { BuildingStorefront, PencilSquare, Trash, Plus, EllipsisHorizontal } from "@medusajs/icons"
import { 
  Container, 
  Heading, 
  Table, 
  Text, 
  Badge, 
  Button,
  DropdownMenu,
  IconButton,
  usePrompt,
  toast
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

interface Restaurant {
  id: string
  name: string
  handle: string
  address: string
  phone: string
  email: string
  image_url?: string
  is_open: boolean
}

const useRestaurants = () => {
  return useQuery({
    queryKey: ["restaurants"],
    queryFn: async () => {
      const response = await fetch(`/restaurants`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch restaurants")
      return response.json()
    },
  })
}

const useDeleteRestaurant = (id: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/restaurants/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to delete restaurant")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurants"] })
    },
  })
}

const RestaurantRow = ({ restaurant }: { restaurant: Restaurant }) => {
  const navigate = useNavigate()
  const prompt = usePrompt()
  const deleteRestaurant = useDeleteRestaurant(restaurant.id)

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Delete Restaurant",
      description: `Are you sure you want to delete "${restaurant.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await deleteRestaurant.mutateAsync()
        toast.success("Restaurant deleted successfully")
      } catch {
        toast.error("Failed to delete restaurant")
      }
    }
  }

  return (
    <Table.Row
      className="cursor-pointer"
      onClick={() => navigate(`/restaurants/${restaurant.id}`)}
    >
      <Table.Cell>
        <div className="flex items-center gap-x-3">
          {restaurant.image_url && (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="h-10 w-10 rounded-md object-cover"
            />
          )}
          <div>
            <Text size="small" weight="plus">
              {restaurant.name}
            </Text>
            <Text size="xsmall" className="text-ui-fg-subtle">
              /{restaurant.handle}
            </Text>
          </div>
        </div>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">{restaurant.address}</Text>
      </Table.Cell>
      <Table.Cell>
        <Text size="small">{restaurant.phone}</Text>
      </Table.Cell>
      <Table.Cell>
        <Badge color={restaurant.is_open ? "green" : "grey"}>
          {restaurant.is_open ? "Open" : "Closed"}
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
              onClick={() => navigate(`/restaurants/${restaurant.id}`)}
            >
              <PencilSquare className="mr-2" />
              View Details
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item 
              onClick={handleDelete} 
              className="text-ui-fg-error"
            >
              <Trash className="mr-2" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>
      </Table.Cell>
    </Table.Row>
  )
}

const RestaurantListPage = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useRestaurants()
  const restaurants: Restaurant[] = data?.restaurants || []

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h1">Restaurants</Heading>
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate("/restaurants/create")}
          >
            <Plus />
            Add Restaurant
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Text className="text-ui-fg-subtle">Loading restaurants...</Text>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center py-10">
            <Text className="text-ui-fg-error">Failed to load restaurants</Text>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-y-4">
            <Text className="text-ui-fg-subtle">No restaurants yet</Text>
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate("/restaurants/create")}
            >
              Create your first restaurant
            </Button>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Name</Table.HeaderCell>
                <Table.HeaderCell>Address</Table.HeaderCell>
                <Table.HeaderCell>Phone</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell className="w-[1%]"></Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {restaurants.map((restaurant) => (
                <RestaurantRow key={restaurant.id} restaurant={restaurant} />
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Restaurants",
  icon: BuildingStorefront,
})

export default RestaurantListPage
