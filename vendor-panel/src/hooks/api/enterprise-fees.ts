import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { sdk } from "../../lib/client"

// Types
export interface EnterpriseFee {
  id: string
  seller_id: string
  name: string
  description?: string
  fee_type: "admin" | "packing" | "transport" | "fundraising" | "sales" | "coordinator"
  calculator_type: "flat_rate" | "flat_per_item" | "percentage" | "weight"
  amount: number
  currency_code?: string
  tax_category_id?: string
  inherits_tax_category: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface OrderCycleFee {
  id: string
  order_cycle_id: string
  enterprise_fee_id: string
  application_type: "coordinator" | "incoming" | "outgoing"
  target_seller_id?: string
  display_order: number
  created_at: string
  enterprise_fee?: EnterpriseFee
}

export interface CreateEnterpriseFeeInput {
  name: string
  description?: string
  fee_type: EnterpriseFee["fee_type"]
  calculator_type: EnterpriseFee["calculator_type"]
  amount: number
  currency_code?: string
  tax_category_id?: string
  inherits_tax_category?: boolean
}

export interface UpdateEnterpriseFeeInput {
  name?: string
  description?: string
  fee_type?: EnterpriseFee["fee_type"]
  calculator_type?: EnterpriseFee["calculator_type"]
  amount?: number
  currency_code?: string
  is_active?: boolean
}

export interface ApplyFeeInput {
  enterprise_fee_id: string
  application_type: "coordinator" | "incoming" | "outgoing"
  target_seller_id?: string
}

// Query keys
export const enterpriseFeeKeys = {
  all: ["enterprise-fees"] as const,
  lists: () => [...enterpriseFeeKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...enterpriseFeeKeys.lists(), filters] as const,
  details: () => [...enterpriseFeeKeys.all, "detail"] as const,
  detail: (id: string) => [...enterpriseFeeKeys.details(), id] as const,
}

export const orderCycleFeeKeys = {
  all: ["order-cycle-fees"] as const,
  list: (orderCycleId: string) => [...orderCycleFeeKeys.all, orderCycleId] as const,
}

// Fetch all enterprise fees for vendor
export const useEnterpriseFees = (params?: { is_active?: boolean }) => {
  return useQuery({
    queryKey: enterpriseFeeKeys.list(params || {}),
    queryFn: async () => {
      const response = await sdk.client.fetch("/vendor/enterprise-fees", {
        query: params,
      })
      return response as { enterprise_fees: EnterpriseFee[]; count: number }
    },
  })
}

// Fetch single enterprise fee
export const useEnterpriseFee = (id: string) => {
  return useQuery({
    queryKey: enterpriseFeeKeys.detail(id),
    queryFn: async () => {
      const response = await sdk.client.fetch("/vendor/enterprise-fees/" + id)
      return response as { enterprise_fee: EnterpriseFee }
    },
    enabled: !!id,
  })
}

// Create enterprise fee
export const useCreateEnterpriseFee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateEnterpriseFeeInput) => {
      const response = await sdk.client.fetch("/vendor/enterprise-fees", {
        method: "POST",
        body: input,
      })
      return response as { enterprise_fee: EnterpriseFee }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enterpriseFeeKeys.lists() })
    },
  })
}

// Update enterprise fee
export const useUpdateEnterpriseFee = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateEnterpriseFeeInput) => {
      const response = await sdk.client.fetch("/vendor/enterprise-fees/" + id, {
        method: "PUT",
        body: input,
      })
      return response as { enterprise_fee: EnterpriseFee }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enterpriseFeeKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: enterpriseFeeKeys.lists() })
    },
  })
}

// Delete enterprise fee
export const useDeleteEnterpriseFee = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await sdk.client.fetch("/vendor/enterprise-fees/" + id, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enterpriseFeeKeys.lists() })
    },
  })
}

// Fetch fees for an order cycle
export const useOrderCycleFees = (orderCycleId: string) => {
  return useQuery({
    queryKey: orderCycleFeeKeys.list(orderCycleId),
    queryFn: async () => {
      const response = await sdk.client.fetch(
        "/vendor/order-cycles/" + orderCycleId + "/fees"
      )
      return response as { fees: OrderCycleFee[] }
    },
    enabled: !!orderCycleId,
  })
}

// Apply fee to order cycle
export const useApplyFeeToOrderCycle = (orderCycleId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ApplyFeeInput) => {
      const response = await sdk.client.fetch(
        "/vendor/order-cycles/" + orderCycleId + "/fees",
        {
          method: "POST",
          body: input,
        }
      )
      return response as { fee: OrderCycleFee }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderCycleFeeKeys.list(orderCycleId),
      })
    },
  })
}

// Remove fee from order cycle
export const useRemoveFeeFromOrderCycle = (orderCycleId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (feeId: string) => {
      await sdk.client.fetch(
        "/vendor/order-cycles/" + orderCycleId + "/fees/" + feeId,
        {
          method: "DELETE",
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderCycleFeeKeys.list(orderCycleId),
      })
    },
  })
}
