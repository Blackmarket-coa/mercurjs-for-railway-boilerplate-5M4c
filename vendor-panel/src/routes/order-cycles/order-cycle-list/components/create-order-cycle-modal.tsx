import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  FocusModal,
  Button,
  Input,
  Label,
  Textarea,
  toast,
  Heading,
  Text,
} from "@medusajs/ui"
import { useCreateOrderCycle } from "../../../../hooks/api/order-cycles"

interface CreateOrderCycleModalProps {
  open: boolean
  onClose: () => void
}

// Get default dates (opens tomorrow, closes in 1 week)
const getDefaultOpenDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(9, 0, 0, 0)
  return date.toISOString().slice(0, 16)
}

const getDefaultCloseDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(17, 0, 0, 0)
  return date.toISOString().slice(0, 16)
}

export const CreateOrderCycleModal = ({
  open,
  onClose,
}: CreateOrderCycleModalProps) => {
  const navigate = useNavigate()
  const createOrderCycle = useCreateOrderCycle()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    opens_at: getDefaultOpenDate(),
    closes_at: getDefaultCloseDate(),
    dispatch_at: "",
    pickup_instructions: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.opens_at || !formData.closes_at) {
      toast.error("Please fill in all required fields")
      return
    }

    const opensAt = new Date(formData.opens_at)
    const closesAt = new Date(formData.closes_at)

    if (closesAt <= opensAt) {
      toast.error("Close date must be after open date")
      return
    }

    try {
      const result = await createOrderCycle.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        opens_at: opensAt.toISOString(),
        closes_at: closesAt.toISOString(),
        dispatch_at: formData.dispatch_at
          ? new Date(formData.dispatch_at).toISOString()
          : undefined,
        pickup_instructions: formData.pickup_instructions || undefined,
      })

      toast.success("Order cycle created successfully")
      onClose()
      navigate(`/order-cycles/${result.order_cycle.id}`)
    } catch (err) {
      toast.error("Failed to create order cycle")
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <FocusModal open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <FocusModal.Content>
        <FocusModal.Header>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={createOrderCycle.isPending}
          >
            Create Order Cycle
          </Button>
        </FocusModal.Header>
        <FocusModal.Body className="flex flex-col items-center py-16">
          <div className="flex w-full max-w-lg flex-col gap-y-8">
            <div>
              <Heading>Create Order Cycle</Heading>
              <Text className="text-ui-fg-subtle">
                Set up a time-bounded ordering window for your products
              </Text>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-y-6">
              <div className="flex flex-col gap-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Weekly Farm Box - January Week 1"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what's included in this order cycle..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="opens_at">Opens At *</Label>
                  <Input
                    id="opens_at"
                    name="opens_at"
                    type="datetime-local"
                    value={formData.opens_at}
                    onChange={handleChange}
                    required
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    When customers can start ordering
                  </Text>
                </div>

                <div className="flex flex-col gap-y-2">
                  <Label htmlFor="closes_at">Closes At *</Label>
                  <Input
                    id="closes_at"
                    name="closes_at"
                    type="datetime-local"
                    value={formData.closes_at}
                    onChange={handleChange}
                    required
                  />
                  <Text size="small" className="text-ui-fg-subtle">
                    Order deadline
                  </Text>
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
                <Text size="small" className="text-ui-fg-subtle">
                  When orders will be dispatched/delivered (optional)
                </Text>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label htmlFor="pickup_instructions">Pickup Instructions</Label>
                <Textarea
                  id="pickup_instructions"
                  name="pickup_instructions"
                  placeholder="e.g., Pickup at 123 Farm Road, Saturday 10am-2pm..."
                  value={formData.pickup_instructions}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </form>
          </div>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  )
}
