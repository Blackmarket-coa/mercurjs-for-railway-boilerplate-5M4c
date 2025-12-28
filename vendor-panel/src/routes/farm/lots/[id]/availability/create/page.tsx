import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  Switch,
  toast,
} from "@medusajs/ui"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { sdk } from "../../../../../../lib/sdk"
import {
  AvailabilityWindowDTO,
  LotDTO,
  SalesChannel,
  SalesChannelLabels,
  PricingStrategy,
  PricingStrategyLabels,
} from "../../../../../../types/domain"

interface AvailabilityFormValues {
  available_from: string
  available_until: string
  sales_channel: SalesChannel
  pricing_strategy: PricingStrategy
  unit_price: number
  currency_code: string
  min_order_quantity: number | null
  max_order_quantity: number | null
  quantity_increment: number | null
  preorder_enabled: boolean
  preorder_deposit_percent: number | null
  estimated_ship_date: string
  pickup_enabled: boolean
  delivery_enabled: boolean
  shipping_enabled: boolean
  fulfillment_lead_time_hours: number | null
  surplus_discount_percent: number | null
  featured: boolean
  is_active: boolean
}

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

const AvailabilityCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: lotId } = useParams<{ id: string }>()
  const { data: lot, isLoading: lotLoading } = useLot(lotId!)

  const form = useForm<AvailabilityFormValues>({
    defaultValues: {
      available_from: new Date().toISOString().split("T")[0],
      available_until: "",
      sales_channel: SalesChannel.DTC,
      pricing_strategy: PricingStrategy.FIXED,
      unit_price: lot?.suggested_price_per_unit || 0,
      currency_code: "USD",
      min_order_quantity: 1,
      max_order_quantity: null,
      quantity_increment: 1,
      preorder_enabled: false,
      preorder_deposit_percent: null,
      estimated_ship_date: "",
      pickup_enabled: true,
      delivery_enabled: false,
      shipping_enabled: true,
      fulfillment_lead_time_hours: 24,
      surplus_discount_percent: lot?.surplus_flag ? 20 : null,
      featured: false,
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: AvailabilityFormValues) => {
      const response = await sdk.client.fetch<{
        availability_window: AvailabilityWindowDTO
      }>(`/vendor/farm/lots/${lotId}/availability`, {
        method: "POST",
        body: {
          ...data,
          available_until: data.available_until || null,
          estimated_ship_date: data.estimated_ship_date || null,
        },
      })
      return response.availability_window
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-lot", lotId] })
      toast.success("Availability window created")
      navigate(`/farm/lots/${lotId}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to create availability: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  const watchPreorder = form.watch("preorder_enabled")

  if (lotLoading) {
    return (
      <Container className="p-6">
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Heading level="h1">Create Availability Window</Heading>
            {lot && (
              <Text className="text-ui-fg-subtle mt-1">
                For lot: {lot.lot_number || `Lot ${lot.id.slice(-6)}`}
              </Text>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate(`/farm/lots/${lotId}`)}
          >
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dates */}
          <div>
            <Heading level="h3" className="mb-4">
              Availability Period
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="available_from">Available From *</Label>
                <Input
                  id="available_from"
                  type="date"
                  {...form.register("available_from", { required: true })}
                />
              </div>
              <div>
                <Label htmlFor="available_until">Available Until</Label>
                <Input
                  id="available_until"
                  type="date"
                  {...form.register("available_until")}
                />
                <Text className="text-ui-fg-subtle text-xs mt-1">
                  Leave blank for open-ended availability
                </Text>
              </div>
            </div>
          </div>

          {/* Sales Channel & Pricing */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Sales Channel & Pricing
            </Heading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sales_channel">Sales Channel *</Label>
                <Controller
                  control={form.control}
                  name="sales_channel"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select channel" />
                      </Select.Trigger>
                      <Select.Content>
                        {(Object.keys(SalesChannelLabels) as SalesChannel[]).map(
                          (key) => (
                            <Select.Item key={key} value={key}>
                              {SalesChannelLabels[key]}
                            </Select.Item>
                          )
                        )}
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="pricing_strategy">Pricing Strategy *</Label>
                <Controller
                  control={form.control}
                  name="pricing_strategy"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select strategy" />
                      </Select.Trigger>
                      <Select.Content>
                        {(Object.keys(PricingStrategyLabels) as PricingStrategy[]).map(
                          (key) => (
                            <Select.Item key={key} value={key}>
                              {PricingStrategyLabels[key]}
                            </Select.Item>
                          )
                        )}
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="currency_code">Currency</Label>
                <Controller
                  control={form.control}
                  name="currency_code"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select currency" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="USD">USD</Select.Item>
                        <Select.Item value="CAD">CAD</Select.Item>
                        <Select.Item value="EUR">EUR</Select.Item>
                        <Select.Item value="GBP">GBP</Select.Item>
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="unit_price">Unit Price ($) *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  {...form.register("unit_price", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  placeholder="e.g., 4.99"
                />
                {lot && (
                  <Text className="text-ui-fg-subtle text-xs mt-1">
                    Suggested: ${lot.suggested_price_per_unit?.toFixed(2) || "N/A"} / {lot.unit}
                  </Text>
                )}
              </div>
              {lot?.surplus_flag && (
                <div>
                  <Label htmlFor="surplus_discount_percent">
                    Surplus Discount (%)
                  </Label>
                  <Input
                    id="surplus_discount_percent"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...form.register("surplus_discount_percent", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g., 20"
                  />
                  <Text className="text-ui-fg-subtle text-xs mt-1">
                    Applied discount for surplus inventory
                  </Text>
                </div>
              )}
            </div>
          </div>

          {/* Order Quantities */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Order Quantities
            </Heading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="min_order_quantity">Min Order Quantity</Label>
                <Input
                  id="min_order_quantity"
                  type="number"
                  step="1"
                  {...form.register("min_order_quantity", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 1"
                />
              </div>
              <div>
                <Label htmlFor="max_order_quantity">Max Order Quantity</Label>
                <Input
                  id="max_order_quantity"
                  type="number"
                  step="1"
                  {...form.register("max_order_quantity", {
                    valueAsNumber: true,
                  })}
                  placeholder="Leave blank for no limit"
                />
              </div>
              <div>
                <Label htmlFor="quantity_increment">Quantity Increment</Label>
                <Input
                  id="quantity_increment"
                  type="number"
                  step="1"
                  {...form.register("quantity_increment", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 1"
                />
              </div>
            </div>
          </div>

          {/* Preorder */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Preorder Settings
            </Heading>
            <div className="flex items-center gap-3 mb-4">
              <Controller
                control={form.control}
                name="preorder_enabled"
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div>
                <Text weight="plus">Enable Preorders</Text>
                <Text className="text-ui-fg-subtle text-sm">
                  Allow customers to order before availability date
                </Text>
              </div>
            </div>
            {watchPreorder && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preorder_deposit_percent">
                    Deposit Percent (%)
                  </Label>
                  <Input
                    id="preorder_deposit_percent"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...form.register("preorder_deposit_percent", {
                      valueAsNumber: true,
                    })}
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <Label htmlFor="estimated_ship_date">Est. Ship Date</Label>
                  <Input
                    id="estimated_ship_date"
                    type="date"
                    {...form.register("estimated_ship_date")}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Fulfillment */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Fulfillment Options
            </Heading>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="pickup_enabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Text weight="plus">Pickup</Text>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="delivery_enabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Text weight="plus">Local Delivery</Text>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="shipping_enabled"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Text weight="plus">Shipping</Text>
              </div>
            </div>
            <div className="mt-4 max-w-xs">
              <Label htmlFor="fulfillment_lead_time_hours">
                Lead Time (hours)
              </Label>
              <Input
                id="fulfillment_lead_time_hours"
                type="number"
                step="1"
                {...form.register("fulfillment_lead_time_hours", {
                  valueAsNumber: true,
                })}
                placeholder="e.g., 24"
              />
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Status
            </Heading>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div>
                  <Text weight="plus">Active</Text>
                  <Text className="text-ui-fg-subtle text-sm">
                    Window is purchasable
                  </Text>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Controller
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div>
                  <Text weight="plus">Featured</Text>
                  <Text className="text-ui-fg-subtle text-sm">
                    Highlight in listings
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate(`/farm/lots/${lotId}`)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={mutation.isPending}
            >
              Create Availability Window
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default AvailabilityCreatePage
