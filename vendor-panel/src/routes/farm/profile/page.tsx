import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Textarea,
  Badge,
  toast,
} from "@medusajs/ui"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { sdk } from "../../../lib/sdk"
import {
  ProducerDTO,
  GrowingPractice,
  GrowingPracticeLabels,
} from "../../../types/domain"

interface CertificationFormValue {
  name: string
  issuer: string
  valid_until: string
  document_url: string
}

interface ProfileFormValues {
  name: string
  handle: string
  description: string
  region: string
  state: string
  country_code: string
  farm_size_acres: number | null
  year_established: number | null
  practices: GrowingPractice[]
  certifications: CertificationFormValue[]
  story: string
  website: string
}

interface RecertificationAlert {
  certification_name: string
  valid_until: string
  days_remaining: number
  status: "expired" | "expiring_soon"
}

interface FarmProfileResponse {
  producer: ProducerDTO | null
  recertification_alerts?: RecertificationAlert[]
}

const useFarmProfile = () => {
  return useQuery({
    queryKey: ["farm-profile"],
    queryFn: async () => {
      return sdk.client.fetch<FarmProfileResponse>("/vendor/farm/profile")
    },
  })
}

const FarmProfileEditPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: farmProfile, isLoading } = useFarmProfile()
  const profile = farmProfile?.producer || null
  const recertificationAlerts = farmProfile?.recertification_alerts || []
  const isCreate = !profile

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: profile?.name || "",
      handle: profile?.handle || "",
      description: profile?.description || "",
      region: profile?.region || "",
      state: profile?.state || "",
      country_code: profile?.country_code || "US",
      farm_size_acres: profile?.farm_size_acres || null,
      year_established: profile?.year_established || null,
      practices: profile?.practices || [],
      certifications: profile?.certifications?.map((cert) => ({
        name: cert.name || "",
        issuer: cert.issuer || "",
        valid_until: cert.valid_until ? String(cert.valid_until).split("T")[0] : "",
        document_url: cert.document_url || "",
      })) || [],
      story: profile?.story || "",
      website: profile?.website || "",
    },
  })



  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "certifications",
  })

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      const method = isCreate ? "POST" : "PUT"
      const certifications = data.certifications
        .filter((cert) => cert.name.trim())
        .map((cert) => ({
          name: cert.name.trim(),
          issuer: cert.issuer.trim() || undefined,
          valid_until: cert.valid_until || undefined,
          document_url: cert.document_url.trim() || undefined,
        }))

      const response = await sdk.client.fetch<{ producer: ProducerDTO }>(
        "/vendor/farm/profile",
        {
          method,
          body: {
            ...data,
            certifications,
          },
        }
      )
      return response.producer
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farm-profile"] })
      toast.success(isCreate ? "Farm profile created" : "Farm profile updated")
      navigate("/farm")
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`)
    },
  })

  const handleSubmit = form.handleSubmit((data) => {
    mutation.mutate(data)
  })

  const togglePractice = (practice: GrowingPractice) => {
    const current = form.getValues("practices")
    if (current.includes(practice)) {
      form.setValue(
        "practices",
        current.filter((p) => p !== practice)
      )
    } else {
      form.setValue("practices", [...current, practice])
    }
  }

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
            {isCreate ? "Create Farm Profile" : "Edit Farm Profile"}
          </Heading>
          <Button variant="secondary" onClick={() => navigate("/farm")}>
            Cancel
          </Button>
        </div>

        {recertificationAlerts.length > 0 && (
          <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
            <Heading level="h3" className="mb-2 text-orange-900">Recertification Notices</Heading>
            <div className="space-y-2">
              {recertificationAlerts.map((alert) => (
                <Text key={`${alert.certification_name}-${alert.valid_until}`} className="text-sm text-orange-900">
                  {alert.status === "expired" ? "Expired" : "Expiring soon"}: <strong>{alert.certification_name}</strong>
                  {" "}({new Date(alert.valid_until).toLocaleDateString()})
                </Text>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Farm Name *</Label>
              <Input
                id="name"
                {...form.register("name", { required: true })}
                placeholder="e.g., Green Valley Farm"
              />
            </div>
            <div>
              <Label htmlFor="handle">Handle *</Label>
              <Input
                id="handle"
                {...form.register("handle", { required: true })}
                placeholder="e.g., green-valley-farm"
              />
              <Text className="text-ui-fg-subtle text-xs mt-1">
                URL-friendly identifier (lowercase, no spaces)
              </Text>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Brief description of your farm"
              rows={3}
            />
          </div>

          {/* Location */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">Location</Heading>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  {...form.register("region")}
                  placeholder="e.g., Central Valley"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  {...form.register("state")}
                  placeholder="e.g., California"
                />
              </div>
              <div>
                <Label htmlFor="country_code">Country Code</Label>
                <Input
                  id="country_code"
                  {...form.register("country_code")}
                  placeholder="e.g., US"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">Farm Details</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="farm_size_acres">Farm Size (acres)</Label>
                <Input
                  id="farm_size_acres"
                  type="number"
                  {...form.register("farm_size_acres", { valueAsNumber: true })}
                  placeholder="e.g., 50"
                />
              </div>
              <div>
                <Label htmlFor="year_established">Year Established</Label>
                <Input
                  id="year_established"
                  type="number"
                  {...form.register("year_established", { valueAsNumber: true })}
                  placeholder="e.g., 1985"
                  min={1800}
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
          </div>

          {/* Growing Practices */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">Growing Practices</Heading>
            <Text className="text-ui-fg-subtle text-sm mb-3">
              Select all practices that apply to your farm
            </Text>
            <Controller
              control={form.control}
              name="practices"
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(GrowingPracticeLabels).map(([key, label]) => {
                    const practice = key as GrowingPractice
                    const isSelected = field.value.includes(practice)
                    return (
                      <Badge
                        key={practice}
                        color={isSelected ? "green" : "grey"}
                        className="cursor-pointer"
                        onClick={() => togglePractice(practice)}
                      >
                        {label}
                      </Badge>
                    )
                  })}
                </div>
              )}
            />
          </div>



          {/* Certifications & Documents */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Heading level="h3">Certifications & Documents</Heading>
                <Text className="text-ui-fg-subtle text-sm mt-1">
                  Add certifications customers should see on your storefront profile.
                </Text>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  appendCertification({
                    name: "",
                    issuer: "",
                    valid_until: "",
                    document_url: "",
                  })
                }
              >
                Add Certification
              </Button>
            </div>

            {certificationFields.length === 0 ? (
              <Text className="text-ui-fg-subtle text-sm">
                No certifications added yet.
              </Text>
            ) : (
              <div className="space-y-4">
                {certificationFields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Heading level="h3">Certification {index + 1}</Heading>
                      <Button type="button" variant="transparent" onClick={() => removeCertification(index)}>
                        Remove
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`certifications.${index}.name`}>Certification Name *</Label>
                        <Input
                          id={`certifications.${index}.name`}
                          {...form.register(`certifications.${index}.name` as const, { required: true })}
                          placeholder="USDA Organic"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`certifications.${index}.issuer`}>Issuing Organization</Label>
                        <Input
                          id={`certifications.${index}.issuer`}
                          {...form.register(`certifications.${index}.issuer` as const)}
                          placeholder="USDA"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`certifications.${index}.valid_until`}>Valid Until</Label>
                        <Input
                          id={`certifications.${index}.valid_until`}
                          type="date"
                          {...form.register(`certifications.${index}.valid_until` as const)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`certifications.${index}.document_url`}>Document URL</Label>
                        <Input
                          id={`certifications.${index}.document_url`}
                          type="url"
                          {...form.register(`certifications.${index}.document_url` as const)}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Story */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">Our Story</Heading>
            <Textarea
              id="story"
              {...form.register("story")}
              placeholder="Tell customers about your farm's history, values, and what makes your products special..."
              rows={6}
            />
          </div>

          {/* Website */}
          <div className="border-t pt-6">
            <Heading level="h3" className="mb-4">Online Presence</Heading>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                {...form.register("website")}
                placeholder="https://www.yourfarm.com"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="border-t pt-6 flex justify-end gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate("/farm")}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={mutation.isPending}
            >
              {isCreate ? "Create Profile" : "Save Changes"}
            </Button>
          </div>
        </form>
      </Container>
    </div>
  )
}

export default FarmProfileEditPage
