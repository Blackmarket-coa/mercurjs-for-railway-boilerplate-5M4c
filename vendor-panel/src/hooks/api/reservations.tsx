import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query"
import { HttpTypes } from "@medusajs/types"
import { fetchQuery } from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"
import {
  inventoryItemLevelsQueryKeys,
  inventoryItemsQueryKeys,
} from "./inventory.tsx"
import { FetchError } from "@medusajs/js-sdk"

const RESERVATION_ITEMS_QUERY_KEY = "reservation_items" as const
export const reservationItemsQueryKeys = queryKeysFactory(
  RESERVATION_ITEMS_QUERY_KEY
)

export const useReservationItem = (
  id: string,
  query?: Record<string, string | number>,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminReservationResponse,
      FetchError,
      HttpTypes.AdminReservationResponse,
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryKey: reservationItemsQueryKeys.detail(id),
    queryFn: async () =>
      fetchQuery(`/vendor/reservations/${id}`, {
        method: "GET",
        query,
      }),
    ...options,
  })

  return { ...data, ...rest }
}

export const useReservationItems = (
  query?: HttpTypes.AdminGetReservationsParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminGetReservationsParams,
      FetchError,
      HttpTypes.AdminReservationListResponse,
      QueryKey
    >,
    "queryKey" | "queryFn"
  >,
  filters?: { inventory_item_id: string[] }
) => {
  const queryWithPotentialInventoryItemFilter = {
    ...(query || {}),
  } as Record<string, unknown>

  const inventoryItemFilter =
    filters?.inventory_item_id ||
    (Array.isArray(queryWithPotentialInventoryItemFilter.inventory_item_id)
      ? (queryWithPotentialInventoryItemFilter.inventory_item_id as string[])
      : undefined)

  delete queryWithPotentialInventoryItemFilter.inventory_item_id

  const requestQuery =
    queryWithPotentialInventoryItemFilter as Record<string, string | number>

  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery("/vendor/reservations", {
        method: "GET",
        query: requestQuery,
      }),
    queryKey: reservationItemsQueryKeys.list({
      ...requestQuery,
      ...(inventoryItemFilter?.length
        ? { inventory_item_id_filter: inventoryItemFilter.join(",") }
        : {}),
    }),
    ...options,
  })

  if (!inventoryItemFilter) {
    return { ...data, ...rest }
  }

  const reservations =
    data?.reservations?.filter((r) =>
      inventoryItemFilter.includes(r.inventory_item_id)
    ) || []

  return {
    reservations,
    count: reservations.length,
    ...rest,
  }
}

export const useUpdateReservationItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminReservationResponse,
    FetchError,
    HttpTypes.AdminUpdateReservation
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminUpdateReservation) =>
      fetchQuery(`/vendor/reservations/${id}`, {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details(),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details(),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useCreateReservationItem = (
  options?: UseMutationOptions<
    HttpTypes.AdminReservationResponse,
    FetchError,
    HttpTypes.AdminCreateReservation
  >
) => {
  return useMutation({
    mutationFn: (payload: HttpTypes.AdminCreateReservation) =>
      fetchQuery("/vendor/reservations", {
        method: "POST",
        body: payload,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details(),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details(),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDeleteReservationItem = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminReservationDeleteResponse,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () =>
      fetchQuery(`/vendor/reservations/${id}`, { method: "DELETE" }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.lists(),
      })
      queryClient.invalidateQueries({
        queryKey: reservationItemsQueryKeys.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryItemsQueryKeys.details(),
      })
      queryClient.invalidateQueries({
        queryKey: inventoryItemLevelsQueryKeys.details(),
      })
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
