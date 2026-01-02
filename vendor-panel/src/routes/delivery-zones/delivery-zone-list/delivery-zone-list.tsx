import { useNavigate } from "react-router-dom"
import { Container, Heading, Button, Badge, Text } from "@medusajs/ui"
import { Plus, MapPin, Trash, PencilSquare } from "@medusajs/icons"
import { useDeliveryZones, useDeleteDeliveryZone } from "../../../hooks/api/delivery-zones"
import { useState } from "react"
import { useVendorType } from "../../../providers/vendor-type-provider"

/**
 * DeliveryZoneList - Lists all delivery zones for the vendor
 * 
 * BMC Design Philosophy:
 * - Clean, minimal interface with warm neutrals
 * - Cards for each zone showing key details
 * - Quick actions for edit/delete
 */
export function DeliveryZoneList() {
  const navigate = useNavigate()
  const { features } = useVendorType()
  const { data, isLoading, error } = useDeliveryZones()
  const { mutate: deleteZone, isPending: isDeleting } = useDeleteDeliveryZone()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Type-specific terminology
  const terminology = features.hasDeliveryZones 
    ? { title: "Delivery Zones", singular: "zone", create: "Create Zone" }
    : { title: "Service Areas", singular: "area", create: "Create Area" }

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to delete this ${terminology.singular}?`)) {
      setDeletingId(id)
      deleteZone(id, {
        onSettled: () => setDeletingId(null),
      })
    }
  }

  if (isLoading) {
    return (
      <Container className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-warm-200 rounded w-1/4" />
          <div className="h-32 bg-warm-100 rounded" />
          <div className="h-32 bg-warm-100 rounded" />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          Failed to load delivery zones. Please try again.
        </div>
      </Container>
    )
  }

  const zones = data?.zones || []

  return (
    <Container className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level="h1" className="text-2xl font-serif text-warm-900">
            {terminology.title}
          </Heading>
          <Text className="text-warm-600 mt-1">
            Define where you can deliver and set your pricing
          </Text>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/delivery-zones/create")}
        >
          <Plus className="mr-2" />
          {terminology.create}
        </Button>
      </div>

      {/* Empty State */}
      {zones.length === 0 && (
        <div className="bg-warm-50 rounded-xl p-12 text-center">
          <MapPin className="w-12 h-12 text-warm-400 mx-auto mb-4" />
          <Heading level="h3" className="text-lg font-medium text-warm-900 mb-2">
            No {terminology.title.toLowerCase()} yet
          </Heading>
          <Text className="text-warm-600 mb-6 max-w-md mx-auto">
            Create your first {terminology.singular} to define where you can deliver 
            and how much you'll charge for delivery.
          </Text>
          <Button
            variant="primary"
            onClick={() => navigate("/delivery-zones/create")}
          >
            <Plus className="mr-2" />
            {terminology.create}
          </Button>
        </div>
      )}

      {/* Zone List */}
      {zones.length > 0 && (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-warm-200 hover:border-warm-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Heading level="h3" className="text-lg font-medium text-warm-900">
                      {zone.name}
                    </Heading>
                    <Badge color={zone.active ? "green" : "grey"}>
                      {zone.active ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-warm-500 font-mono">
                      {zone.code}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <Text className="text-sm text-warm-500">Base Fee</Text>
                      <Text className="font-medium text-warm-900">
                        ${(zone.base_delivery_fee / 100).toFixed(2)}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-sm text-warm-500">Per Mile</Text>
                      <Text className="font-medium text-warm-900">
                        ${(zone.per_mile_fee / 100).toFixed(2)}
                      </Text>
                    </div>
                    <div>
                      <Text className="text-sm text-warm-500">Min Order</Text>
                      <Text className="font-medium text-warm-900">
                        {zone.minimum_order 
                          ? `$${(zone.minimum_order / 100).toFixed(2)}`
                          : "None"
                        }
                      </Text>
                    </div>
                  </div>

                  {/* Service Hours Summary */}
                  {zone.service_hours && (
                    <div className="mt-4">
                      <Text className="text-sm text-warm-500">Service Hours</Text>
                      <Text className="text-sm text-warm-700">
                        {Object.entries(zone.service_hours as Record<string, { open: string; close: string }>)
                          .slice(0, 3)
                          .map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1, 3)}: ${hours.open}-${hours.close}`)
                          .join(", ")}
                        {Object.keys(zone.service_hours).length > 3 && "..."}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => navigate(`/delivery-zones/${zone.id}/edit`)}
                  >
                    <PencilSquare className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleDelete(zone.id)}
                    disabled={isDeleting && deletingId === zone.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  )
}
