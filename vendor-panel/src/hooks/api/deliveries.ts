import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { fetchQuery } from "../../lib/client"

// ===========================================
// TYPES
// ===========================================

export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "COURIER_EN_ROUTE_PICKUP"
  | "COURIER_ARRIVED_PICKUP"
  | "WAITING_FOR_ORDER"
  | "ORDER_PICKED_UP"
  | "EN_ROUTE_DELIVERY"
  | "ARRIVED_AT_DESTINATION"
  | "ATTEMPTING_DELIVERY"
  | "DELIVERED"
  | "DELIVERED_TO_NEIGHBOR"
  | "DELIVERED_TO_SAFE_PLACE"
  | "DELIVERY_FAILED"
  | "CUSTOMER_NOT_AVAILABLE"
  | "WRONG_ADDRESS"
  | "REFUSED"
  | "RETURNED_TO_PRODUCER"
  | "CANCELLED"

export type DeliveryPriority =
  | "STANDARD"
  | "EXPRESS"
  | "SCHEDULED"
  | "ASAP"
  | "BATCH"
  | "VOLUNTEER"

export interface StatusHistoryEntry {
  status: DeliveryStatus
  timestamp: string
  note?: string
  actor?: "vendor" | "courier" | "customer" | "system"
}

export interface Courier {
  id: string
  display_name: string
  phone: string | null
  vehicle_type: string | null
  avatar_url: string | null
}

export interface Delivery {
  id: string
  delivery_number: string
  order_id: string
  producer_id: string
  courier_id: string | null
  courier?: Courier | null
  
  // Status
  status: DeliveryStatus
  status_history: StatusHistoryEntry[] | null
  priority: DeliveryPriority
  
  // Pickup
  pickup_address: string
  pickup_latitude: number | null
  pickup_longitude: number | null
  pickup_instructions: string | null
  pickup_contact_name: string | null
  pickup_contact_phone: string | null
  
  // Delivery
  delivery_address: string
  delivery_latitude: number | null
  delivery_longitude: number | null
  delivery_instructions: string | null
  recipient_name: string
  recipient_phone: string | null
  
  // Options
  contactless_delivery: boolean
  leave_at_door: boolean
  safe_place_description: string | null
  
  // Timing
  assigned_at: string | null
  estimated_pickup_at: string | null
  picked_up_at: string | null
  estimated_delivery_at: string | null
  delivered_at: string | null
  
  // Distance
  estimated_distance_miles: number | null
  actual_distance_miles: number | null
  
  // Fees
  delivery_fee: number | null
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface DeliverySummary {
  pending: number
  active: number
  completed: number
  failed: number
}

interface ListDeliveriesQuery {
  status?: DeliveryStatus
  priority?: DeliveryPriority
  from_date?: string
  to_date?: string
  limit?: number
  offset?: number
}

interface ListDeliveriesResponse {
  deliveries: Delivery[]
  count: number
  summary: DeliverySummary
  limit: number
  offset: number
}

export interface UpdateDeliveryInput {
  status: "ASSIGNED" | "WAITING_FOR_ORDER" | "ORDER_PICKED_UP" | "CANCELLED"
  note?: string
}

// ===========================================
// QUERY KEYS
// ===========================================

export const deliveriesQueryKeys = {
  all: ["deliveries"] as const,
  lists: () => [...deliveriesQueryKeys.all, "list"] as const,
  list: (query?: ListDeliveriesQuery) =>
    [...deliveriesQueryKeys.lists(), query] as const,
  details: () => [...deliveriesQueryKeys.all, "detail"] as const,
  detail: (id: string) => [...deliveriesQueryKeys.details(), id] as const,
}

// ===========================================
// API FUNCTIONS
// ===========================================

async function listDeliveries(
  query?: ListDeliveriesQuery
): Promise<ListDeliveriesResponse> {
  const response = await fetchQuery("/vendor/deliveries", {
    method: "GET",
    query: query as Record<string, string | number>,
  })
  return response
}

async function getDelivery(id: string): Promise<{ delivery: Delivery }> {
  const response = await fetchQuery(`/vendor/deliveries/${id}`, {
    method: "GET",
  })
  return response
}

async function updateDeliveryStatus(
  id: string,
  data: UpdateDeliveryInput
): Promise<{ delivery: Delivery }> {
  const response = await fetchQuery(`/vendor/deliveries/${id}`, {
    method: "POST",
    body: data,
  })
  return response
}

// ===========================================
// HOOKS
// ===========================================

/**
 * List deliveries with optional filters
 */
export function useDeliveries(
  query?: ListDeliveriesQuery,
  options?: Omit<
    UseQueryOptions<
      ListDeliveriesResponse,
      Error,
      ListDeliveriesResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: deliveriesQueryKeys.list(query),
    queryFn: () => listDeliveries(query),
    ...options,
  })
}

/**
 * Get single delivery
 */
export function useDelivery(
  id: string,
  options?: Omit<
    UseQueryOptions<
      { delivery: Delivery },
      Error,
      { delivery: Delivery },
      QueryKey
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: deliveriesQueryKeys.detail(id),
    queryFn: () => getDelivery(id),
    enabled: !!id,
    ...options,
  })
}

/**
 * Update delivery status (vendor actions)
 */
export function useUpdateDeliveryStatus(
  id: string,
  options?: UseMutationOptions<
    { delivery: Delivery },
    Error,
    UpdateDeliveryInput
  >
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data) => updateDeliveryStatus(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: deliveriesQueryKeys.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: deliveriesQueryKeys.lists(),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: DeliveryStatus): string {
  const labels: Record<DeliveryStatus, string> = {
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    COURIER_EN_ROUTE_PICKUP: "Courier En Route",
    COURIER_ARRIVED_PICKUP: "Courier Arrived",
    WAITING_FOR_ORDER: "Waiting for Order",
    ORDER_PICKED_UP: "Picked Up",
    EN_ROUTE_DELIVERY: "In Transit",
    ARRIVED_AT_DESTINATION: "Arrived",
    ATTEMPTING_DELIVERY: "Attempting Delivery",
    DELIVERED: "Delivered",
    DELIVERED_TO_NEIGHBOR: "Delivered to Neighbor",
    DELIVERED_TO_SAFE_PLACE: "Delivered to Safe Place",
    DELIVERY_FAILED: "Failed",
    CUSTOMER_NOT_AVAILABLE: "Customer Not Available",
    WRONG_ADDRESS: "Wrong Address",
    REFUSED: "Refused",
    RETURNED_TO_PRODUCER: "Returned",
    CANCELLED: "Cancelled",
  }
  return labels[status] || status
}

/**
 * Get status color for badges
 */
export function getStatusColor(
  status: DeliveryStatus
): "green" | "orange" | "red" | "blue" | "purple" | "grey" {
  const completed: DeliveryStatus[] = [
    "DELIVERED",
    "DELIVERED_TO_NEIGHBOR",
    "DELIVERED_TO_SAFE_PLACE",
  ]
  const failed: DeliveryStatus[] = [
    "DELIVERY_FAILED",
    "CUSTOMER_NOT_AVAILABLE",
    "WRONG_ADDRESS",
    "REFUSED",
    "RETURNED_TO_PRODUCER",
    "CANCELLED",
  ]
  const pending: DeliveryStatus[] = ["PENDING"]
  const inTransit: DeliveryStatus[] = [
    "COURIER_EN_ROUTE_PICKUP",
    "EN_ROUTE_DELIVERY",
    "ARRIVED_AT_DESTINATION",
    "ATTEMPTING_DELIVERY",
  ]
  
  if (completed.includes(status)) return "green"
  if (failed.includes(status)) return "red"
  if (pending.includes(status)) return "orange"
  if (inTransit.includes(status)) return "purple"
  return "blue"
}

/**
 * Get priority label
 */
export function getPriorityLabel(priority: DeliveryPriority): string {
  const labels: Record<DeliveryPriority, string> = {
    STANDARD: "Standard",
    EXPRESS: "Express",
    SCHEDULED: "Scheduled",
    ASAP: "ASAP",
    BATCH: "Batch",
    VOLUNTEER: "Volunteer",
  }
  return labels[priority] || priority
}

/**
 * Check if status is actionable by vendor
 */
export function isVendorActionable(status: DeliveryStatus): boolean {
  return ["PENDING", "ASSIGNED", "COURIER_ARRIVED_PICKUP", "WAITING_FOR_ORDER"].includes(status)
}
