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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { sdk } from "../../../../../../lib/sdk"
import {
  LotDTO,
  LotGrade,
  LotGradeLabels,
  LotAllocation,
  LotAllocationLabels,
} from "../../../../../../types/domain"

interface LotFormValues {
  lot_number: string
  batch_date: string
  grade: LotGrade
  size_class: string
  quantity_total: number
  unit: string
  suggested_price_per_unit: number | null
  cost_per_unit: number | null
  allocation_type: LotAllocation
  best_by_date: string
  use_by_date: string
  storage_location: string
  storage_requirements: string
  external_lot_id: string
  is_active: boolean
}

const LotCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id: harvestId } = useParams<{ id: string }>()

  const form = useForm<LotFormValues>({
    defaultValues: {
      lot_number: "",
      batch_date: new Date().toISOString().split("T")[0],
      grade: LotGrade.GRADE_A,
      size_class: "",
      quantity_total: 0,
      unit: "lb",
      suggested_price_per_unit: null,
      cost_per_unit: null,
      allocation_type: LotAllocation.RETAIL,
      best_by_date: "",
      use_by_date: "",
      storage_location: "",
      storage_requirements: "",
      external_lot_id: "",
      is_active: true,
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: LotFormValues) => {
      const response = await sdk.client.fetch<{ lot: LotDTO }>(
        `/vendor/farm/harvests/${harvestId}/lots`,
        {
          method: "POST",
          body: {
            ...data,
            batch_date: data.batch_date || null,
            best_by_date: data.best_by_date || null,
            use_by_date: data.use_by_date || null,
          },
        }
      )
      return response.lot
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-harvest", harvestId] })
      queryClient.invalidateQueries({ queryKey: ["farm-harvests"] })
      toast.success("Lot created successfully")
      navigate(`/farm/harvests/${harvestId}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to create lot: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Heading level="h1">Create Lot</Heading>
          <Button
            variant="secondary"
            onClick={() => navigate(`/farm/harvests/${harvestId}`)}
          >
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <Heading level="h3" className="mb-4">
              Lot Information
            </Heading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="lot_number">Lot Number</Label>
                <Input
                  id="lot_number"
                  {...form.register("lot_number")}
                  placeholder="e.g., LOT-2024-001"
                />
                <Text className="text-ui-fg-subtle text-xs mt-1">
                  Leave blank to auto-generate
                </Text>
              </div>
              <div>
                <Label htmlFor="batch_date">Batch Date</Label>
                <Input
                  id="batch_date"
                  type="date"
                  {...form.register("batch_date")}
                />
              </div>
              <div>
                <Label htmlFor="external_lot_id">External Lot ID</Label>
                <Input
                  id="external_lot_id"
                  {...form.register("external_lot_id")}
                  placeholder="From your tracking system"
                />
              </div>
            </div>
          </div>

          {/* Grade & Quality */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Grade & Quality
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade *</Label>
                <Controller
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select grade" />
                      </Select.Trigger>
                      <Select.Content>
                        {(Object.keys(LotGradeLabels) as LotGrade[]).map((key) => (
                          <Select.Item key={key} value={key}>
                            {LotGradeLabels[key]}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="size_class">Size Class</Label>
                <Input
                  id="size_class"
                  {...form.register("size_class")}
                  placeholder="e.g., Large, Medium, Small"
                />
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Quantity
            </Heading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity_total">Total Quantity *</Label>
                <Input
                  id="quantity_total"
                  type="number"
                  step="0.01"
                  {...form.register("quantity_total", {
                    valueAsNumber: true,
                    required: true,
                  })}
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit *</Label>
                <Controller
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select unit" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="lb">Pounds (lb)</Select.Item>
                        <Select.Item value="kg">Kilograms (kg)</Select.Item>
                        <Select.Item value="oz">Ounces (oz)</Select.Item>
                        <Select.Item value="bunch">Bunches</Select.Item>
                        <Select.Item value="case">Cases</Select.Item>
                        <Select.Item value="flat">Flats</Select.Item>
                        <Select.Item value="pint">Pints</Select.Item>
                        <Select.Item value="quart">Quarts</Select.Item>
                        <Select.Item value="head">Heads</Select.Item>
                        <Select.Item value="count">Count</Select.Item>
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="allocation_type">Allocation</Label>
                <Controller
                  control={form.control}
                  name="allocation_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder="Select allocation" />
                      </Select.Trigger>
                      <Select.Content>
                        {(Object.keys(LotAllocationLabels) as LotAllocation[]).map(
                          (key) => (
                            <Select.Item key={key} value={key}>
                              {LotAllocationLabels[key]}
                            </Select.Item>
                          )
                        )}
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Pricing
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggested_price_per_unit">
                  Suggested Price per Unit ($)
                </Label>
                <Input
                  id="suggested_price_per_unit"
                  type="number"
                  step="0.01"
                  {...form.register("suggested_price_per_unit", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 4.99"
                />
              </div>
              <div>
                <Label htmlFor="cost_per_unit">Cost per Unit ($)</Label>
                <Input
                  id="cost_per_unit"
                  type="number"
                  step="0.01"
                  {...form.register("cost_per_unit", { valueAsNumber: true })}
                  placeholder="e.g., 2.50"
                />
                <Text className="text-ui-fg-subtle text-xs mt-1">
                  Internal tracking only
                </Text>
              </div>
            </div>
          </div>

          {/* Shelf Life */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Shelf Life & Storage
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="best_by_date">Best By Date</Label>
                <Input
                  id="best_by_date"
                  type="date"
                  {...form.register("best_by_date")}
                />
              </div>
              <div>
                <Label htmlFor="use_by_date">Use By Date</Label>
                <Input
                  id="use_by_date"
                  type="date"
                  {...form.register("use_by_date")}
                />
              </div>
              <div>
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  {...form.register("storage_location")}
                  placeholder="e.g., Cold Storage A"
                />
              </div>
              <div>
                <Label htmlFor="storage_requirements">Storage Requirements</Label>
                <Input
                  id="storage_requirements"
                  {...form.register("storage_requirements")}
                  placeholder="e.g., Refrigerate at 34-38°F"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Status
            </Heading>
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
                  Active lots can be linked to availability windows
                </Text>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate(`/farm/harvests/${harvestId}`)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={mutation.isPending}
            >
              Create Lot
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default LotCreatePage
