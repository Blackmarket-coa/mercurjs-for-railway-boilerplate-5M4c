import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Heading, Button, Badge, Text, Tabs } from "@medusajs/ui"
import { ArrowPath, Eye, CheckCircle, XCircle } from "@medusajs/icons"
import {
  useDeliveries,
  useUpdateDeliveryStatus,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  isVendorActionable,
  Delivery,
} from "../../../hooks/api/deliveries"

/**
 * DeliveryList - Lists all deliveries for the vendor
 * 
 * BMC Design Philosophy:
 * - Clear status organization (Pending, Active, Completed)
 * - Quick actions for common operations
 * - Auto-refresh for real-time updates
 */
export function DeliveryList() {
  const [activeTab, setActiveTab] = useState("pending")
  const { data, isLoading, error, refetch, isFetching } = useDeliveries(undefined, {
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  })

  const deliveries = data?.deliveries || []
  const summary = data?.summary || { pending: 0, active: 0, completed: 0, failed: 0 }

  // Group deliveries by status
  const pendingDeliveries = deliveries.filter(d => d.status === "PENDING")
  const activeDeliveries = deliveries.filter(d => 
    !["PENDING", "DELIVERED", "DELIVERED_TO_NEIGHBOR", "DELIVERED_TO_SAFE_PLACE", 
      "DELIVERY_FAILED", "CUSTOMER_NOT_AVAILABLE", "WRONG_ADDRESS", "REFUSED", 
      "RETURNED_TO_PRODUCER", "CANCELLED"].includes(d.status)
  )
  const completedDeliveries = deliveries.filter(d => 
    ["DELIVERED", "DELIVERED_TO_NEIGHBOR", "DELIVERED_TO_SAFE_PLACE"].includes(d.status)
  )
  const failedDeliveries = deliveries.filter(d => 
    ["DELIVERY_FAILED", "CUSTOMER_NOT_AVAILABLE", "WRONG_ADDRESS", "REFUSED", 
      "RETURNED_TO_PRODUCER", "CANCELLED"].includes(d.status)
  )

  if (isLoading) {
    return (
      <Container className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-warm-200 rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-warm-100 rounded" />
            ))}
          </div>
          <div className="h-64 bg-warm-100 rounded" />
        </div>
      </Container>
    )
  }

  if (error) {
    return (
      <Container className="p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg">
          Failed to load deliveries. Please try again.
        </div>
      </Container>
    )
  }

  return (
    <Container className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level="h1" className="text-2xl font-serif text-warm-900">
            Delivery Orders
          </Heading>
          <Text className="text-warm-600 mt-1">
            Manage incoming delivery orders
          </Text>
        </div>
        <Button
          variant="secondary"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <ArrowPath className={`mr-2 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Pending"
          count={summary.pending}
          color="orange"
          highlight={summary.pending > 0}
        />
        <SummaryCard
          label="Active"
          count={summary.active}
          color="blue"
        />
        <SummaryCard
          label="Completed"
          count={summary.completed}
          color="green"
        />
        <SummaryCard
          label="Failed/Cancelled"
          count={summary.failed}
          color="grey"
        />
      </div>

      {/* Pending Orders Alert */}
      {pendingDeliveries.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-center gap-4">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
          <Text className="text-orange-800 font-medium">
            You have {pendingDeliveries.length} pending order{pendingDeliveries.length > 1 ? "s" : ""} waiting for your response
          </Text>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Trigger value="pending">
            Pending ({pendingDeliveries.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="active">
            Active ({activeDeliveries.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="completed">
            Completed ({completedDeliveries.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="failed">
            Failed ({failedDeliveries.length})
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="pending" className="mt-6">
          <DeliverySection
            deliveries={pendingDeliveries}
            showActions
            emptyMessage="No pending orders"
          />
        </Tabs.Content>

        <Tabs.Content value="active" className="mt-6">
          <DeliverySection
            deliveries={activeDeliveries}
            emptyMessage="No active orders"
          />
        </Tabs.Content>

        <Tabs.Content value="completed" className="mt-6">
          <DeliverySection
            deliveries={completedDeliveries}
            emptyMessage="No completed orders today"
          />
        </Tabs.Content>

        <Tabs.Content value="failed" className="mt-6">
          <DeliverySection
            deliveries={failedDeliveries}
            emptyMessage="No failed orders"
          />
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

function SummaryCard({ 
  label, 
  count, 
  color,
  highlight = false,
}: { 
  label: string
  count: number
  color: "orange" | "blue" | "green" | "grey"
  highlight?: boolean
}) {
  const colorClasses = {
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    grey: "bg-warm-50 border-warm-200 text-warm-700",
  }

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]} ${highlight ? "ring-2 ring-orange-400" : ""}`}>
      <Text className="text-sm font-medium">{label}</Text>
      <div className="text-3xl font-bold mt-1">{count}</div>
    </div>
  )
}

function DeliverySection({ 
  deliveries, 
  showActions = false,
  emptyMessage,
}: { 
  deliveries: Delivery[]
  showActions?: boolean
  emptyMessage: string
}) {
  if (deliveries.length === 0) {
    return (
      <div className="bg-warm-50 rounded-xl p-12 text-center">
        <Text className="text-warm-500">{emptyMessage}</Text>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => (
        <DeliveryCard 
          key={delivery.id} 
          delivery={delivery}
          showActions={showActions}
        />
      ))}
    </div>
  )
}

function DeliveryCard({ 
  delivery, 
  showActions = false,
}: { 
  delivery: Delivery
  showActions?: boolean
}) {
  const navigate = useNavigate()
  const { mutate: updateStatus, isPending } = useUpdateDeliveryStatus(delivery.id)

  const handleAccept = () => {
    updateStatus({ status: "ASSIGNED", note: "Accepted by vendor" })
  }

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel this delivery?")) {
      updateStatus({ status: "CANCELLED", note: "Cancelled by vendor" })
    }
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-warm-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <span className="font-medium text-warm-900">
              Order #{delivery.delivery_number || delivery.id.slice(-8)}
            </span>
            <Badge color={getStatusColor(delivery.status)}>
              {getStatusLabel(delivery.status)}
            </Badge>
            <Badge color="grey" className="font-normal">
              {getPriorityLabel(delivery.priority)}
            </Badge>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Text className="text-xs text-warm-500 uppercase tracking-wide">Pickup</Text>
              <Text className="text-warm-700">{delivery.pickup_address}</Text>
              {delivery.pickup_contact_name && (
                <Text className="text-sm text-warm-500">{delivery.pickup_contact_name}</Text>
              )}
            </div>
            <div>
              <Text className="text-xs text-warm-500 uppercase tracking-wide">Deliver to</Text>
              <Text className="text-warm-700">{delivery.delivery_address}</Text>
              <Text className="text-sm text-warm-500">{delivery.recipient_name}</Text>
              {delivery.recipient_phone && (
                <Text className="text-sm text-warm-500">{delivery.recipient_phone}</Text>
              )}
            </div>
          </div>

          {/* Delivery options */}
          {(delivery.contactless_delivery || delivery.leave_at_door || delivery.delivery_instructions) && (
            <div className="bg-warm-50 rounded-lg p-3 mb-4">
              {delivery.contactless_delivery && (
                <Text className="text-sm text-warm-700">📱 Contactless delivery requested</Text>
              )}
              {delivery.leave_at_door && (
                <Text className="text-sm text-warm-700">🚪 Leave at door</Text>
              )}
              {delivery.delivery_instructions && (
                <Text className="text-sm text-warm-600">
                  📝 {delivery.delivery_instructions}
                </Text>
              )}
            </div>
          )}

          {/* Courier Info */}
          {delivery.courier && (
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center">
                {delivery.courier.avatar_url ? (
                  <img 
                    src={delivery.courier.avatar_url} 
                    alt={delivery.courier.display_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-warm-600 text-sm">
                    {delivery.courier.display_name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <Text className="text-sm font-medium text-warm-900">
                  {delivery.courier.display_name}
                </Text>
                {delivery.courier.phone && (
                  <Text className="text-sm text-warm-500">{delivery.courier.phone}</Text>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Times & Actions */}
        <div className="text-right ml-6">
          {delivery.estimated_delivery_at && (
            <div className="mb-2">
              <Text className="text-xs text-warm-500">ETA</Text>
              <Text className="font-medium text-warm-900">
                {new Date(delivery.estimated_delivery_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </div>
          )}
          {delivery.delivery_fee && (
            <div className="mb-4">
              <Text className="text-xs text-warm-500">Fee</Text>
              <Text className="font-medium text-warm-900">
                ${(delivery.delivery_fee / 100).toFixed(2)}
              </Text>
            </div>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={() => navigate(`/deliveries/${delivery.id}`)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Details
          </Button>
        </div>
      </div>

      {/* Action Buttons for Pending */}
      {showActions && delivery.status === "PENDING" && (
        <div className="flex gap-3 mt-4 pt-4 border-t border-warm-100">
          <Button
            variant="primary"
            onClick={handleAccept}
            disabled={isPending}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2" />
            Accept Order
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isPending}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircle className="mr-2" />
            Decline
          </Button>
        </div>
      )}

      {/* Status update buttons for active orders */}
      {isVendorActionable(delivery.status) && delivery.status !== "PENDING" && (
        <VendorStatusActions delivery={delivery} />
      )}
    </div>
  )
}

function VendorStatusActions({ delivery }: { delivery: Delivery }) {
  const { mutate: updateStatus, isPending } = useUpdateDeliveryStatus(delivery.id)

  const getNextAction = () => {
    switch (delivery.status) {
      case "ASSIGNED":
        return { label: "Start Preparing", status: "WAITING_FOR_ORDER" as const }
      case "WAITING_FOR_ORDER":
      case "COURIER_ARRIVED_PICKUP":
        return { label: "Order Ready for Pickup", status: "ORDER_PICKED_UP" as const }
      default:
        return null
    }
  }

  const action = getNextAction()
  if (!action) return null

  return (
    <div className="mt-4 pt-4 border-t border-warm-100">
      <Button
        variant="primary"
        onClick={() => updateStatus({ status: action.status })}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Updating..." : action.label}
      </Button>
    </div>
  )
}
