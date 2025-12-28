import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Select,
  Textarea,
  toast,
} from "@medusajs/ui"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { sdk } from "../../../../lib/sdk"
import {
  HarvestDTO,
  Season,
  SeasonLabels,
  HarvestVisibility,
  HarvestVisibilityLabels,
} from "../../../../types/domain"

interface HarvestFormValues {
  crop_name: string
  variety: string
  category: string
  harvest_date: string
  planted_date: string
  season: Season
  year: number
  growing_method: string
  field_name: string
  farmer_notes: string
  weather_notes: string
  taste_notes: string
  usage_tips: string
  expected_yield_quantity: number | null
  expected_yield_unit: string
  visibility_status: HarvestVisibility
}

const useHarvest = (id?: string) => {
  return useQuery({
    queryKey: ["farm-harvest", id],
    queryFn: async () => {
      if (!id) return null
      const response = await sdk.client.fetch<{ harvest: HarvestDTO }>(
        `/vendor/farm/harvests/${id}`
      )
      return response.harvest
    },
    enabled: !!id,
  })
}

const HarvestCreatePage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const { data: harvest, isLoading } = useHarvest(id)
  const isEdit = !!id

  const currentYear = new Date().getFullYear()

  const form = useForm<HarvestFormValues>({
    defaultValues: {
      crop_name: harvest?.crop_name || "",
      variety: harvest?.variety || "",
      category: harvest?.category || "",
      harvest_date: harvest?.harvest_date?.split("T")[0] || "",
      planted_date: harvest?.planted_date?.split("T")[0] || "",
      season: harvest?.season || Season.SUMMER,
      year: harvest?.year || currentYear,
      growing_method: harvest?.growing_method || "",
      field_name: harvest?.field_name || "",
      farmer_notes: harvest?.farmer_notes || "",
      weather_notes: harvest?.weather_notes || "",
      taste_notes: harvest?.taste_notes || "",
      usage_tips: harvest?.usage_tips || "",
      expected_yield_quantity: harvest?.expected_yield_quantity || null,
      expected_yield_unit: harvest?.expected_yield_unit || "lb",
      visibility_status: harvest?.visibility_status || HarvestVisibility.DRAFT,
    },
  })

  const mutation = useMutation({
    mutationFn: async (data: HarvestFormValues) => {
      const method = isEdit ? "PUT" : "POST"
      const url = isEdit
        ? `/vendor/farm/harvests/${id}`
        : "/vendor/farm/harvests"

      const response = await sdk.client.fetch<{ harvest: HarvestDTO }>(url, {
        method,
        body: {
          ...data,
          harvest_date: data.harvest_date || null,
          planted_date: data.planted_date || null,
        },
      })
      return response.harvest
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["farm-harvests"] })
      queryClient.invalidateQueries({ queryKey: ["farm-harvest", id] })
      toast.success(isEdit ? "Harvest updated" : "Harvest created")
      navigate(`/farm/harvests/${data.id}`)
    },
    onError: (error: Error) => {
      toast.error(`Failed to save harvest: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  if (isLoading) {
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
          <Heading level="h1">
            {isEdit ? "Edit Harvest" : "Log New Harvest"}
          </Heading>
          <Button variant="secondary" onClick={() => navigate("/farm/harvests")}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Info */}
          <div>
            <Heading level="h3" className="mb-4">
              Crop Information
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="crop_name">Crop Name *</Label>
                <Input
                  id="crop_name"
                  {...form.register("crop_name", { required: true })}
                  placeholder="e.g., Tomatoes"
                />
              </div>
              <div>
                <Label htmlFor="variety">Variety</Label>
                <Input
                  id="variety"
                  {...form.register("variety")}
                  placeholder="e.g., Brandywine, Cherry, Roma"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  {...form.register("category")}
                  placeholder="e.g., Vegetables, Fruits, Herbs"
                />
              </div>
              <div>
                <Label htmlFor="growing_method">Growing Method</Label>
                <Input
                  id="growing_method"
                  {...form.register("growing_method")}
                  placeholder="e.g., Organic, No-till, Greenhouse"
                />
              </div>
            </div>
          </div>

          {/* Dates & Season */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Dates & Season
            </Heading>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="planted_date">Planted Date</Label>
                <Input
                  id="planted_date"
                  type="date"
                  {...form.register("planted_date")}
                />
              </div>
              <div>
                <Label htmlFor="harvest_date">Harvest Date</Label>
                <Input
                  id="harvest_date"
                  type="date"
                  {...form.register("harvest_date")}
                />
              </div>
              <div>
                <Label htmlFor="season">Season *</Label>
                <Controller
                  control={form.control}
                  name="season"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <Select.Trigger>
                        <Select.Value placeholder="Select season" />
                      </Select.Trigger>
                      <Select.Content>
                        {Object.entries(SeasonLabels).map(([key, label]) => (
                          <Select.Item key={key} value={key}>
                            {label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  {...form.register("year", { valueAsNumber: true })}
                  min={currentYear - 5}
                  max={currentYear + 1}
                />
              </div>
            </div>
          </div>

          {/* Field Info */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Field Information
            </Heading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="field_name">Field Name</Label>
                <Input
                  id="field_name"
                  {...form.register("field_name")}
                  placeholder="e.g., North Field, Block A"
                />
              </div>
              <div>
                <Label htmlFor="expected_yield_quantity">Expected Yield</Label>
                <Input
                  id="expected_yield_quantity"
                  type="number"
                  {...form.register("expected_yield_quantity", {
                    valueAsNumber: true,
                  })}
                  placeholder="e.g., 500"
                />
              </div>
              <div>
                <Label htmlFor="expected_yield_unit">Unit</Label>
                <Controller
                  control={form.control}
                  name="expected_yield_unit"
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
                      </Select.Content>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Notes & Details
            </Heading>
            <div className="space-y-4">
              <div>
                <Label htmlFor="farmer_notes">Farmer Notes</Label>
                <Textarea
                  id="farmer_notes"
                  {...form.register("farmer_notes")}
                  placeholder="Internal notes about this harvest..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weather_notes">Weather Notes</Label>
                  <Textarea
                    id="weather_notes"
                    {...form.register("weather_notes")}
                    placeholder="Weather conditions during growing..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="taste_notes">Taste Notes</Label>
                  <Textarea
                    id="taste_notes"
                    {...form.register("taste_notes")}
                    placeholder="Flavor profile, sweetness, etc..."
                    rows={2}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="usage_tips">Usage Tips</Label>
                <Textarea
                  id="usage_tips"
                  {...form.register("usage_tips")}
                  placeholder="Cooking suggestions, storage tips for customers..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">
              Visibility
            </Heading>
            <div className="max-w-xs">
              <Label htmlFor="visibility_status">Status</Label>
              <Controller
                control={form.control}
                name="visibility_status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select status" />
                    </Select.Trigger>
                    <Select.Content>
                      {Object.entries(HarvestVisibilityLabels).map(
                        ([key, label]) => (
                          <Select.Item key={key} value={key}>
                            {label}
                          </Select.Item>
                        )
                      )}
                    </Select.Content>
                  </Select>
                )}
              />
              <Text className="text-ui-fg-subtle text-xs mt-1">
                Draft harvests are only visible to you. Public harvests can be
                linked to products.
              </Text>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/farm/harvests")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={mutation.isPending}
            >
              {isEdit ? "Save Changes" : "Log Harvest"}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default HarvestCreatePage
