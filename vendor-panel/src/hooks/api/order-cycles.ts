import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

// Types
export interface OrderCycle {
  id: string
  name: string
  description?: string
  status: "draft" | "upcoming" | "open" | "closed" | "completed"
  opens_at: string
  closes_at: string
  dispatch_at?: string
  coordinator_seller_id: string
  pickup_instructions?: string
  created_at: string
  updated_at: string
  products?: OrderCycleProduct[]
  sellers?: OrderCycleSeller[]
}

export interface OrderCycleProduct {
  id: string
  order_cycle_id: string
  variant_id: string
  seller_id: string
  override_price?: number
  available_quantity?: number
  sold_quantity: number
  created_at: string
  variant?: {
    id: string
    title: string
    sku?: string
    product?: {
      id: string
      title: string
      thumbnail?: string
    }
  }
}

export interface OrderCycleSeller {
  id: string
  order_cycle_id: string
  seller_id: string
  seller?: {
    id: string
    name: string
  }
}

export interface CreateOrderCycleInput {
  name: string
  description?: string
  opens_at: string
  closes_at: string
  dispatch_at?: string
  pickup_instructions?: string
}

export interface UpdateOrderCycleInput {
  name?: string
  description?: string
  status?: string
  opens_at?: string
  closes_at?: string
  dispatch_at?: string
  pickup_instructions?: string
}

export interface AddProductInput {
  variant_id: string
  override_price?: number
  available_quantity?: number
}

// Query keys
export const orderCycleKeys = {
  all: ["order-cycles"] as const,
  lists: () => [...orderCycleKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...orderCycleKeys.lists(), filters] as const,
  details: () => [...orderCycleKeys.all, "detail"] as const,
  detail: (id: string) => [...orderCycleKeys.details(), id] as const,
}

// Fetch all order cycles for vendor
export const useOrderCycles = (params?: {
  status?: string
  limit?: number
  offset?: number
}) => {
  return useQuery({
    queryKey: orderCycleKeys.list(params || {}),
    queryFn: async () => {
      const response = await sdk.client.fetch("/vendor/order-cycles", {
        query: params,
      })
      return response as { order_cycles: OrderCycle[]; count: number }
    },
  })
}

// Fetch single order cycle
export const useOrderCycle = (id: string) => {
  return useQuery({
    queryKey: orderCycleKeys.detail(id),
    queryFn: async () => {
      const response = await sdk.client.fetch("/vendor/order-cycles/" + id)
      return response as { order_cycle: OrderCycle }
    },
    enabled: !!id,
  })
}

// Create order cycle
export const useCreateOrderCycle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateOrderCycleInput) => {
      const response = await sdk.client.fetch("/vendor/order-cycles", {
        method: "POST",
        body: input,
      })
      return response as { order_cycle: OrderCycle }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderCycleKeys.lists() })
    },
  })
}

// Update order cycle
export const useUpdateOrderCycle = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateOrderCycleInput) => {
      const response = await sdk.client.fetch("/vendor/order-cycles/" + id, {
        method: "PUT",
        body: input,
      })
      return response as { order_cycle: OrderCycle }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderCycleKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: orderCycleKeys.lists() })
    },
  })
}

// Delete order cycle
export const useDeleteOrderCycle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch("/vendor/order-cycles/" + id, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderCycleKeys.lists() })
    },
  })
}

// Add product to order cycle
export const useAddOrderCycleProduct = (orderCycleId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddProductInput) => {
      const response = await sdk.client.fetch(
        "/vendor/order-cycles/" + orderCycleId + "/products",
        {
          method: "POST",
          body: input,
        }
      )
      return response as { product: OrderCycleProduct }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderCycleKeys.detail(orderCycleId),
      })
    },
  })
}

// Remove product from order cycle
export const useRemoveOrderCycleProduct = (orderCycleId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productId: string) => {
      await sdk.client.fetch(
        "/vendor/order-cycles/" + orderCycleId + "/products/" + productId,
        {
          method: "DELETE",
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderCycleKeys.detail(orderCycleId),
      })
    },
  })
}
