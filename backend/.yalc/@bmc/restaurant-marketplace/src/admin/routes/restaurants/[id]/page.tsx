import { ArrowLeft, Trash } from "@medusajs/icons"
import { 
  Container, 
  Heading, 
  Text, 
  Badge, 
  Button,
  usePrompt,
  toast,
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"

interface Restaurant {
  id: string
  name: string
  handle: string
  description?: string
  address: string
  phone: string
  email: string
  image_url?: string
  is_open: boolean
  products?: any[]
  deliveries?: any[]
  admins?: any[]
}

const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ["restaurants", id],
    queryFn: async () => {
      const response = await fetch(`/restaurants/${id}`, {
        credentials: "include",
      })
      if (!response.ok) throw new Error("Failed to fetch restaurant")
      return response.json()
    },
    enabled: !!id,
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

const getDeliveryStatusColor = (status: string): "green" | "blue" | "orange" | "grey" | "red" => {
  switch (status) {
    case "delivered":
      return "green"
    case "in_transit":
    case "ready_for_pickup":
      return "blue"
    case "restaurant_preparing":
    case "restaurant_accepted":
      return "orange"
    case "restaurant_declined":
      return "red"
    default:
      return "grey"
  }
}

const RestaurantDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const prompt = usePrompt()

  const { data, isLoading, isError } = useRestaurant(id!)
  const deleteRestaurant = useDeleteRestaurant(id!)

  const restaurant: Restaurant | undefined = data?.restaurant

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Delete Restaurant",
      description: `Are you sure you want to delete "${restaurant?.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await deleteRestaurant.mutateAsync()
        toast.success("Restaurant deleted successfully")
        navigate("/restaurants")
      } catch {
        toast.error("Failed to delete restaurant")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-y-3">
        <Container className="divide-y p-0">
          <div className="flex items-center justify-center py-10">
            <Text className="text-ui-fg-subtle">Loading...</Text>
          </div>
        </Container>
      </div>
    )
  }

  if (isError || !restaurant) {
    return (
      <div className="flex flex-col gap-y-3">
        <Container className="divide-y p-0">
          <div className="flex items-center justify-center py-10">
            <Text className="text-ui-fg-error">Failed to load restaurant</Text>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      {/* Back Button */}
      <div>
        <Button
          variant="transparent"
          size="small"
          onClick={() => navigate("/restaurants")}
        >
          <ArrowLeft className="mr-1" />
          Back to Restaurants
        </Button>
      </div>

      {/* Header Section */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-x-4">
            {restaurant.image_url && (
              <img
                src={restaurant.image_url}
                alt={restaurant.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            )}
            <div>
              <div className="flex items-center gap-x-2">
                <Heading level="h1">{restaurant.name}</Heading>
                <Badge color={restaurant.is_open ? "green" : "grey"}>
                  {restaurant.is_open ? "Open" : "Closed"}
                </Badge>
              </div>
              <Text className="text-ui-fg-subtle">/{restaurant.handle}</Text>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              variant="danger"
              size="small"
              onClick={handleDelete}
            >
              <Trash className="mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </Container>

      {/* Details Section */}
      <Container className="divide-y p-0">
        <div className="px-6 py-4">
          <Heading level="h2" className="mb-4">Details</Heading>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">
                Address
              </Text>
              <Text>{restaurant.address}</Text>
            </div>
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">
                Phone
              </Text>
              <Text>{restaurant.phone}</Text>
            </div>
            <div>
              <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">
                Email
              </Text>
              <Text>{restaurant.email}</Text>
            </div>
            {restaurant.description && (
              <div className="col-span-2">
                <Text size="small" weight="plus" className="text-ui-fg-subtle mb-1">
                  Description
                </Text>
                <Text>{restaurant.description}</Text>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Deliveries Section */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Active Deliveries</Heading>
        </div>
        <div className="px-6 py-4">
          {restaurant.deliveries && restaurant.deliveries.length > 0 ? (
            <div className="space-y-2">
              {restaurant.deliveries.map((delivery: any) => (
                <div 
                  key={delivery.id} 
                  className="flex items-center justify-between p-3 bg-ui-bg-subtle rounded-lg"
                >
                  <div>
                    <Text size="small" weight="plus">
                      Delivery #{delivery.id.slice(-8)}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      Status: {delivery.delivery_status}
                    </Text>
                  </div>
                  <Badge color={getDeliveryStatusColor(delivery.delivery_status)}>
                    {delivery.delivery_status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <Text className="text-ui-fg-subtle">No active deliveries</Text>
          )}
        </div>
      </Container>

      {/* Products Section */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Menu Products</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            {restaurant.products?.length || 0} products
          </Text>
        </div>
        <div className="px-6 py-4">
          {restaurant.products && restaurant.products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {restaurant.products.map((product: any) => (
                <div 
                  key={product.id}
                  className="p-3 bg-ui-bg-subtle rounded-lg"
                >
                  <Text size="small" weight="plus">{product.title}</Text>
                  {product.variants?.[0]?.calculated_price && (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {product.variants[0].calculated_price.calculated_amount}
                    </Text>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Text className="text-ui-fg-subtle">
              No products linked to this restaurant yet.
            </Text>
          )}
        </div>
      </Container>

      {/* Restaurant Admins Section */}
      <Container className="divide-y p-0">
        <div className="flex items-center justify-between px-6 py-4">
          <Heading level="h2">Restaurant Admins</Heading>
        </div>
        <div className="px-6 py-4">
          {restaurant.admins && restaurant.admins.length > 0 ? (
            <div className="space-y-2">
              {restaurant.admins.map((admin: any) => (
                <div 
                  key={admin.id}
                  className="flex items-center gap-3 p-3 bg-ui-bg-subtle rounded-lg"
                >
                  {admin.avatar_url && (
                    <img 
                      src={admin.avatar_url} 
                      alt={`${admin.first_name} ${admin.last_name}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <Text size="small" weight="plus">
                      {admin.first_name} {admin.last_name}
                    </Text>
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      {admin.email}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Text className="text-ui-fg-subtle">No admins assigned</Text>
          )}
        </div>
      </Container>
    </div>
  )
}

export default RestaurantDetailPage
