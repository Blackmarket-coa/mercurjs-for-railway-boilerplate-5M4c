import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Container,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Label,
  Textarea,
  toast,
  usePrompt,
  DropdownMenu,
  IconButton,
} from "@medusajs/ui"
import { EllipsisHorizontal, Trash, ArrowPath } from "@medusajs/icons"
import {
  OrderCycle,
  useUpdateOrderCycle,
  useDeleteOrderCycle,
} from "../../../../hooks/api/order-cycles"

const statusColors: Record<string, "green" | "blue" | "orange" | "grey" | "red"> = {
  draft: "grey",
  upcoming: "blue",
  open: "green",
  closed: "orange",
  completed: "grey",
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const toInputDate = (dateString: string) => {
  return new Date(dateString).toISOString().slice(0, 16)
}

interface OrderCycleGeneralSectionProps {
  orderCycle: OrderCycle
}

export const OrderCycleGeneralSection = ({
  orderCycle,
}: OrderCycleGeneralSectionProps) => {
  const navigate = useNavigate()
  const prompt = usePrompt()
  const [isEditing, setIsEditing] = useState(false)
  const updateOrderCycle = useUpdateOrderCycle(orderCycle.id)
  const deleteOrderCycle = useDeleteOrderCycle()

  const [formData, setFormData] = useState({
    name: orderCycle.name,
    description: orderCycle.description || "",
    opens_at: toInputDate(orderCycle.opens_at),
    closes_at: toInputDate(orderCycle.closes_at),
    dispatch_at: orderCycle.dispatch_at ? toInputDate(orderCycle.dispatch_at) : "",
    pickup_instructions: orderCycle.pickup_instructions || "",
  })

  const handleSave = async () => {
    try {
      await updateOrderCycle.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        opens_at: new Date(formData.opens_at).toISOString(),
        closes_at: new Date(formData.closes_at).toISOString(),
        dispatch_at: formData.dispatch_at
          ? new Date(formData.dispatch_at).toISOString()
          : undefined,
        pickup_instructions: formData.pickup_instructions || undefined,
      })
      toast.success("Order cycle updated successfully")
      setIsEditing(false)
    } catch (err) {
      toast.error("Failed to update order cycle")
    }
  }

  const handleDelete = async () => {
    const confirmed = await prompt({
      title: "Delete Order Cycle",
      description: `Are you sure you want to delete "${orderCycle.name}"? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
    })

    if (confirmed) {
      try {
        await deleteOrderCycle.mutateAsync(orderCycle.id)
        toast.success("Order cycle deleted successfully")
        navigate("/order-cycles")
      } catch (err) {
        toast.error("Failed to delete order cycle")
      }
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateOrderCycle.mutateAsync({ status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
    } catch (err) {
      toast.error("Failed to update status")
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-x-4">
          <Heading level="h2">{orderCycle.name}</Heading>
          <Badge color={statusColors[orderCycle.status] || "grey"}>
            {orderCycle.status}
          </Badge>
        </div>
        <div className="flex items-center gap-x-2">
          {isEditing ? (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} isLoading={updateOrderCycle.isPending}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <IconButton variant="transparent">
                    <EllipsisHorizontal />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Label>Change Status</DropdownMenu.Label>
                  {["draft", "upcoming", "open", "closed", "completed"].map(
                    (status) => (
                      <DropdownMenu.Item
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        disabled={status === orderCycle.status}
                      >
                        <ArrowPath className="mr-2" />
                        Set to {status}
                      </DropdownMenu.Item>
                    )
                  )}
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
            </>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        {isEditing ? (
          <div className="flex flex-col gap-y-4">
            <div className="flex flex-col gap-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="opens_at">Opens At</Label>
                <Input
                  id="opens_at"
                  name="opens_at"
                  type="datetime-local"
                  value={formData.opens_at}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="closes_at">Closes At</Label>
                <Input
                  id="closes_at"
                  name="closes_at"
                  type="datetime-local"
                  value={formData.closes_at}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="dispatch_at">Dispatch Date</Label>
              <Input
                id="dispatch_at"
                name="dispatch_at"
                type="datetime-local"
                value={formData.dispatch_at}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-y-2">
              <Label htmlFor="pickup_instructions">Pickup Instructions</Label>
              <Textarea
                id="pickup_instructions"
                name="pickup_instructions"
                value={formData.pickup_instructions}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Text className="text-ui-fg-subtle" size="small">
                Description
              </Text>
              <Text>{orderCycle.description || "No description"}</Text>
            </div>

            <div>
              <Text className="text-ui-fg-subtle" size="small">
                Pickup Instructions
              </Text>
              <Text>
                {orderCycle.pickup_instructions || "No pickup instructions"}
              </Text>
            </div>

            <div>
              <Text className="text-ui-fg-subtle" size="small">
                Opens
              </Text>
              <Text>{formatDate(orderCycle.opens_at)}</Text>
            </div>

            <div>
              <Text className="text-ui-fg-subtle" size="small">
                Closes
              </Text>
              <Text>{formatDate(orderCycle.closes_at)}</Text>
            </div>

            {orderCycle.dispatch_at && (
              <div>
                <Text className="text-ui-fg-subtle" size="small">
                  Dispatch Date
                </Text>
                <Text>{formatDate(orderCycle.dispatch_at)}</Text>
              </div>
            )}

            <div>
              <Text className="text-ui-fg-subtle" size="small">
                Created
              </Text>
              <Text>{formatDate(orderCycle.created_at)}</Text>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}
