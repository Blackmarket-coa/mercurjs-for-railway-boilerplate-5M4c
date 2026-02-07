import { useParams, useNavigate } from "react-router-dom"
import { Container, Heading, Button, Text, Badge } from "@medusajs/ui"
import { ArrowLeft, MapPin, Clock, Phone, User, Package } from "@medusajs/icons"
import { SingleColumnPage } from "../../../components/layout/pages"
import { useDashboardExtension } from "../../../extensions"
import {
  useDelivery,
  useUpdateDeliveryStatus,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  isVendorActionable,
} from "../../../hooks/api/deliveries"

/**
 * DeliveryDetail - View and manage a single delivery
 *
 * Shows full details of a delivery order and allows
 * vendors to update status and add notes.
 */
export function DeliveryDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getWidgets } = useDashboardExtension()
  const { data, isLoading, error } = useDelivery(id!)
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateDeliveryStatus(id!)

  if (isLoading) {
    return (
      <SingleColumnPage
      widgets={{
        before: getWidgets("delivery.detail.before"),
        after: getWidgets("delivery.detail.after"),
      }}
    >
        <Container className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-warm-200 rounded w-1/4" />
            <div className="h-64 bg-warm-100 rounded" />
          </div>
        </Container>
      </SingleColumnPage>
    )
  }

  if (error || !data?.delivery) {
    return (
      <SingleColumnPage
      widgets={{
        before: getWidgets("delivery.detail.before"),
        after: getWidgets("delivery.detail.after"),
      }}
    >
        <Container className="p-8">
          <div className="bg-red-50 text-red-800 p-4 rounded-lg">
            Delivery not found or failed to load.
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/deliveries")}
            className="mt-4"
          >
            <ArrowLeft className="mr-2" />
            Back to Deliveries
          </Button>
        </Container>
      </SingleColumnPage>
    )
  }

  const delivery = data.delivery

  const handleStatusUpdate = (newStatus: string, note?: string) => {
    updateStatus({ status: newStatus, note })
  }

  return (
    <SingleColumnPage
      widgets={{
        before: getWidgets("delivery.detail.before"),
        after: getWidgets("delivery.detail.after"),
      }}
    >
      <Container className="p-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="transparent"
            onClick={() => navigate("/deliveries")}
            className="mb-4 -ml-2 text-warm-600 hover:text-warm-900"
          >
            <ArrowLeft className="mr-2" />
            Back to Deliveries
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <Heading level="h1" className="text-2xl font-serif text-warm-900">
                Delivery #{delivery.delivery_number || delivery.id.slice(-8)}
              </Heading>
              <div className="flex items-center gap-3 mt-2">
                <Badge color={getStatusColor(delivery.status)}>
                  {getStatusLabel(delivery.status)}
                </Badge>
                <Badge color="grey">
                  {getPriorityLabel(delivery.priority)}
                </Badge>
                {delivery.created_at && (
                  <Text className="text-warm-500 text-sm">
                    Created {new Date(delivery.created_at).toLocaleString()}
                  </Text>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Addresses */}
          <div className="space-y-6">
            {/* Pickup */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-warm-500" />
                <Heading level="h3" className="text-lg font-medium text-warm-900">
                  Pickup Location
                </Heading>
              </div>
              <Text className="text-warm-700">{delivery.pickup_address}</Text>
              {delivery.pickup_contact_name && (
                <div className="flex items-center gap-2 mt-2 text-warm-600">
                  <User className="w-4 h-4" />
                  <Text className="text-sm">{delivery.pickup_contact_name}</Text>
                </div>
              )}
              {delivery.pickup_contact_phone && (
                <div className="flex items-center gap-2 mt-1 text-warm-600">
                  <Phone className="w-4 h-4" />
                  <Text className="text-sm">{delivery.pickup_contact_phone}</Text>
                </div>
              )}
            </div>

            {/* Delivery */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-green-600" />
                <Heading level="h3" className="text-lg font-medium text-warm-900">
                  Delivery Location
                </Heading>
              </div>
              <Text className="text-warm-700">{delivery.delivery_address}</Text>
              <div className="flex items-center gap-2 mt-2 text-warm-600">
                <User className="w-4 h-4" />
                <Text className="text-sm">{delivery.recipient_name}</Text>
              </div>
              {delivery.recipient_phone && (
                <div className="flex items-center gap-2 mt-1 text-warm-600">
                  <Phone className="w-4 h-4" />
                  <Text className="text-sm">{delivery.recipient_phone}</Text>
                </div>
              )}
              {delivery.recipient_email && (
                <Text className="text-sm text-warm-500 mt-1">
                  {delivery.recipient_email}
                </Text>
              )}
            </div>

            {/* Delivery Instructions */}
            {(delivery.delivery_instructions || delivery.contactless_delivery || delivery.leave_at_door) && (
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <Heading level="h3" className="text-lg font-medium text-warm-900 mb-3">
                  Special Instructions
                </Heading>
                {delivery.contactless_delivery && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="blue">Contactless Delivery</Badge>
                  </div>
                )}
                {delivery.leave_at_door && (
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="blue">Leave at Door</Badge>
                  </div>
                )}
                {delivery.delivery_instructions && (
                  <Text className="text-warm-700 mt-2">
                    {delivery.delivery_instructions}
                  </Text>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Details & Actions */}
          <div className="space-y-6">
            {/* Timing */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-warm-500" />
                <Heading level="h3" className="text-lg font-medium text-warm-900">
                  Timing
                </Heading>
              </div>
              <div className="space-y-3">
                {delivery.scheduled_pickup_at && (
                  <div className="flex justify-between">
                    <Text className="text-warm-600">Scheduled Pickup</Text>
                    <Text className="font-medium text-warm-900">
                      {new Date(delivery.scheduled_pickup_at).toLocaleString()}
                    </Text>
                  </div>
                )}
                {delivery.estimated_delivery_at && (
                  <div className="flex justify-between">
                    <Text className="text-warm-600">Estimated Delivery</Text>
                    <Text className="font-medium text-warm-900">
                      {new Date(delivery.estimated_delivery_at).toLocaleString()}
                    </Text>
                  </div>
                )}
                {delivery.actual_delivery_at && (
                  <div className="flex justify-between">
                    <Text className="text-warm-600">Actual Delivery</Text>
                    <Text className="font-medium text-green-600">
                      {new Date(delivery.actual_delivery_at).toLocaleString()}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Courier Info */}
            {delivery.courier && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
                <Heading level="h3" className="text-lg font-medium text-warm-900 mb-4">
                  Courier
                </Heading>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-warm-200 flex items-center justify-center">
                    {delivery.courier.avatar_url ? (
                      <img
                        src={delivery.courier.avatar_url}
                        alt={delivery.courier.display_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-warm-600 text-lg">
                        {delivery.courier.display_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <Text className="font-medium text-warm-900">
                      {delivery.courier.display_name}
                    </Text>
                    {delivery.courier.phone && (
                      <Text className="text-sm text-warm-600">
                        {delivery.courier.phone}
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fees */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
              <div className="flex items-center gap-2 mb-4">
                <Package className="text-warm-500" />
                <Heading level="h3" className="text-lg font-medium text-warm-900">
                  Order Details
                </Heading>
              </div>
              <div className="space-y-3">
                {delivery.delivery_fee !== undefined && (
                  <div className="flex justify-between">
                    <Text className="text-warm-600">Delivery Fee</Text>
                    <Text className="font-medium text-warm-900">
                      ${(delivery.delivery_fee / 100).toFixed(2)}
                    </Text>
                  </div>
                )}
                {delivery.distance_miles !== undefined && (
                  <div className="flex justify-between">
                    <Text className="text-warm-600">Distance</Text>
                    <Text className="font-medium text-warm-900">
                      {delivery.distance_miles.toFixed(1)} miles
                    </Text>
                  </div>
                )}
                {delivery.order_id && (
                  <div className="flex justify-between">
                    <Text className="text-warm-600">Order ID</Text>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => navigate(`/orders/${delivery.order_id}`)}
                      className="text-blue-600 hover:text-blue-800 p-0"
                    >
                      View Order
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isVendorActionable(delivery.status) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
                <Heading level="h3" className="text-lg font-medium text-warm-900 mb-4">
                  Actions
                </Heading>
                <div className="space-y-3">
                  {delivery.status === "PENDING" && (
                    <>
                      <Button
                        variant="primary"
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate("ASSIGNED", "Accepted by vendor")}
                        disabled={isUpdating}
                      >
                        Accept Order
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to decline this order?")) {
                            handleStatusUpdate("CANCELLED", "Declined by vendor")
                          }
                        }}
                        disabled={isUpdating}
                      >
                        Decline Order
                      </Button>
                    </>
                  )}
                  {delivery.status === "ASSIGNED" && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleStatusUpdate("WAITING_FOR_ORDER")}
                      disabled={isUpdating}
                    >
                      Start Preparing
                    </Button>
                  )}
                  {(delivery.status === "WAITING_FOR_ORDER" || delivery.status === "COURIER_ARRIVED_PICKUP") && (
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => handleStatusUpdate("ORDER_PICKED_UP")}
                      disabled={isUpdating}
                    >
                      Order Ready for Pickup
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status History */}
        {delivery.status_history && delivery.status_history.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-warm-200">
            <Heading level="h3" className="text-lg font-medium text-warm-900 mb-4">
              Status History
            </Heading>
            <div className="space-y-3">
              {delivery.status_history.map((entry: any, index: number) => (
                <div key={index} className="flex items-start gap-4 pb-3 border-b border-warm-100 last:border-0">
                  <div className="w-24 text-sm text-warm-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                  <div>
                    <Badge color={getStatusColor(entry.status)}>
                      {getStatusLabel(entry.status)}
                    </Badge>
                    {entry.note && (
                      <Text className="text-sm text-warm-600 mt-1">{entry.note}</Text>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </SingleColumnPage>
  )
}

export const Component = DeliveryDetail
