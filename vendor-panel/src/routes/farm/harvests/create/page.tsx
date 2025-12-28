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
  Badge,
  Tooltip,
} from "@medusajs/ui"
import { InformationCircle, LightBulb, CheckCircle } from "@medusajs/icons"
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

// Field help text
const FIELD_HELP = {
  crop_name: "The main type of crop (e.g., Tomatoes, Lettuce, Basil)",
  variety: "Specific variety or cultivar (e.g., Brandywine, Butterhead, Genovese)",
  category: "Group similar crops for easier filtering (e.g., Vegetables, Herbs)",
  growing_method: "How this crop was grown (e.g., Organic, Hydroponic, No-till)",
  field_name: "Where on your farm this was grown (helps track productivity)",
  visibility: {
    DRAFT: "Only visible to you - use while planning",
    PREVIEW: "Share with select partners before public launch",
    PUBLIC: "Visible to all customers",
    ARCHIVED: "Hidden from view but preserved for records"
  }
}

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
      {/* Page Header with context */}
      <Container className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heading level="h1">
                {isEdit ? "Edit Harvest" : "Log New Harvest"}
              </Heading>
              {!isEdit && <Badge color="green" size="xsmall">Step 1 of 3</Badge>}
            </div>
            <Text className="text-ui-fg-subtle">
              {isEdit 
                ? "Update harvest details and notes" 
                : "Record your harvest details to start tracking inventory"
              }
            </Text>
          </div>
          <Button variant="secondary" onClick={() => navigate("/farm/harvests")}>
            Cancel
          </Button>
        </div>

        {/* Quick tip for new users */}
        {!isEdit && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <LightBulb className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <Text className="font-medium text-amber-800">Quick Tip</Text>
                <Text className="text-amber-700 text-sm mt-1">
                  Start with the basics (crop name and season). You can always add more details later 
                  or update this harvest as you learn more.
                </Text>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Info */}
          <div className="bg-ui-bg-subtle rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heading level="h3">Crop Information</Heading>
              <Badge color="red" size="xsmall">Required</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="crop_name">Crop Name *</Label>
                  <Tooltip content={FIELD_HELP.crop_name}>
                    <InformationCircle className="w-3.5 h-3.5 text-ui-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="crop_name"
                  {...form.register("crop_name", { required: true })}
                  placeholder="e.g., Tomatoes"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="variety">Variety</Label>
                  <Tooltip content={FIELD_HELP.variety}>
                    <InformationCircle className="w-3.5 h-3.5 text-ui-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="variety"
                  {...form.register("variety")}
                  placeholder="e.g., Brandywine, Cherry, Roma"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="category">Category</Label>
                  <Tooltip content={FIELD_HELP.category}>
                    <InformationCircle className="w-3.5 h-3.5 text-ui-fg-muted cursor-help" />
                  </Tooltip>
                </div>
                <Input
                  id="category"
                  {...form.register("category")}
                  placeholder="e.g., Vegetables, Fruits, Herbs"
                />
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="growing_method">Growing Method</Label>
                  <Tooltip content={FIELD_HELP.growing_method}>
                    <InformationCircle className="w-3.5 h-3.5 text-ui-fg-muted cursor-help" />
                  </Tooltip>
                </div>
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
            <div className="flex items-center gap-2 mb-4">
              <Heading level="h3">Field Information</Heading>
              <Badge color="grey" size="xsmall">Optional</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <Label htmlFor="field_name">Field Name</Label>
                  <Tooltip content={FIELD_HELP.field_name}>
                    <InformationCircle className="w-3.5 h-3.5 text-ui-fg-muted cursor-help" />
                  </Tooltip>
                </div>
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
            <div className="flex items-center gap-2 mb-4">
              <Heading level="h3">Notes & Details</Heading>
              <Badge color="grey" size="xsmall">Optional</Badge>
            </div>
            <Text className="text-ui-fg-subtle text-sm mb-4">
              Add notes to remember important details. Customer-facing notes (taste notes, usage tips) 
              will be shown on your product pages.
            </Text>
            <div className="space-y-4">
              <div>
                <Label htmlFor="farmer_notes">Farmer Notes</Label>
                <Text className="text-ui-fg-muted text-xs mb-1">Private - only visible to you</Text>
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
                  <Text className="text-ui-fg-muted text-xs mb-1">Private</Text>
                  <Textarea
                    id="weather_notes"
                    {...form.register("weather_notes")}
                    placeholder="Weather conditions during growing..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="taste_notes">Taste Notes</Label>
                  <Text className="text-ui-fg-muted text-xs mb-1">Shown to customers</Text>
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
                <Text className="text-ui-fg-muted text-xs mb-1">Shown to customers</Text>
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
            <div className="max-w-md">
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
              
              {/* Visibility explanation */}
              <div className="mt-3 space-y-2">
                {Object.entries(FIELD_HELP.visibility).map(([key, desc]) => (
                  <div 
                    key={key}
                    className={`flex items-start gap-2 p-2 rounded text-sm ${
                      form.watch("visibility_status") === key 
                        ? "bg-ui-bg-subtle" 
                        : "opacity-60"
                    }`}
                  >
                    {form.watch("visibility_status") === key ? (
                      <CheckCircle className="w-4 h-4 text-ui-fg-success mt-0.5" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    <div>
                      <Text className="font-medium">{HarvestVisibilityLabels[key as HarvestVisibility]}</Text>
                      <Text className="text-ui-fg-subtle text-xs">{desc}</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex items-center justify-between">
            <Text className="text-ui-fg-subtle text-sm">
              {isEdit 
                ? "Changes will be saved immediately" 
                : "You can edit this harvest anytime after creating it"
              }
            </Text>
            <div className="flex gap-2">
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
          </div>
        </form>
      </Container>

      {/* What's Next Panel */}
      {!isEdit && (
        <Container className="p-6 bg-ui-bg-subtle">
          <Heading level="h3" className="mb-3">What happens next?</Heading>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-medium">1</div>
              <div>
                <Text className="font-medium">Create harvest</Text>
                <Text className="text-ui-fg-subtle text-sm">You're doing this now</Text>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">2</div>
              <div>
                <Text className="font-medium">Add lots</Text>
                <Text className="text-ui-fg-subtle text-sm">Break into inventory batches</Text>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-medium">3</div>
              <div>
                <Text className="font-medium">Link products</Text>
                <Text className="text-ui-fg-subtle text-sm">Make available for sale</Text>
              </div>
            </div>
          </div>
        </Container>
      )}
    </div>
  )
}

export default HarvestCreatePage
