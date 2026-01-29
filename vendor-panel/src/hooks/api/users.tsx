import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import {
  QueryKey,
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  backendUrl,
  clearAuthToken,
  fetchQuery,
  getAuthToken,
  getAuthTokenPayload,
} from "../../lib/client"
import { queryClient } from "../../lib/query-client"
import { queryKeysFactory } from "../../lib/query-key-factory"
import { StoreVendor, TeamMemberProps } from "../../types/user"

const USERS_QUERY_KEY = "users" as const
const usersQueryKeys = {
  ...queryKeysFactory(USERS_QUERY_KEY),
  me: () => [USERS_QUERY_KEY, "me"],
  registrationStatus: () => [USERS_QUERY_KEY, "registration-status"],
}

/**
 * Registration status response from the backend
 */
export interface RegistrationStatusResponse {
  status: "approved" | "pending" | "rejected" | "cancelled" | "no_request" | "unauthenticated" | "unknown" | "error"
  seller_id?: string
  seller?: {
    id: string
    store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE" | null
  }
  store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE" | null
  request_id?: string
  message: string
  created_at?: string
  reviewer_note?: string
}

const fetchRegistrationStatus = async (
  token: string
): Promise<RegistrationStatusResponse> => {
  const response = await fetch(`${backendUrl}/auth/seller/registration-status`, {
    method: "GET",
    credentials: "include",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  const result = await response.json()
  return result as RegistrationStatusResponse
}

/**
 * Hook to check the registration status of the current user.
 * This is useful for determining if a user's seller account is:
 * - approved (can access dashboard)
 * - pending (waiting for admin approval)
 * - rejected/cancelled (needs to re-register or contact support)
 * - no_request (needs to complete registration)
 */
export const useRegistrationStatus = (
  options?: Omit<
    UseQueryOptions<RegistrationStatusResponse, Error, RegistrationStatusResponse, QueryKey>,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: async (): Promise<RegistrationStatusResponse> => {
      const token = getAuthToken()
      if (!token) {
        return {
          status: "unauthenticated",
          message: "No authentication token found.",
        }
      }

      return fetchRegistrationStatus(token)
    },
    queryKey: usersQueryKeys.registrationStatus(),
    // Don't refetch too often
    staleTime: 30000, // 30 seconds
    // Don't retry on error - status endpoint handles all cases
    retry: false,
    ...options,
  })

  return {
    registrationStatus: data,
    ...rest,
  }
}

export const useMe = (
  options?: UseQueryOptions<
    HttpTypes.AdminUserResponse,
    FetchError,
    HttpTypes.AdminUserResponse & {
      seller: StoreVendor
    },
    QueryKey
  >
) => {
  const queryClient = useQueryClient()

  const { data, ...rest } = useQuery({
    queryFn: async () => {
      const token = getAuthToken()
      if (!token) {
        return null
      }

      const cachedStatus = queryClient.getQueryData<RegistrationStatusResponse>(
        usersQueryKeys.registrationStatus()
      )
      const status = cachedStatus ?? (await fetchRegistrationStatus(token))
      if (status.status !== "approved" || !status.seller_id) {
        return null
      }

      const payload = getAuthTokenPayload()
      const actorType = payload?.actor_type
      if (actorType && actorType !== "seller") {
        clearAuthToken()
        return null
      }

      return fetchQuery("/vendor/sellers/me", {
        method: "GET",
        query: {
          fields:
            "id,name,description,phone,email,media,address_line,postal_code,country_code,city,metadata,tax_id,photo,store_status,website_url,social_links,storefront_links",
        },
      })
    },
    queryKey: usersQueryKeys.me(),
    retry: false,
    ...options,
  })

  return {
    seller: data?.seller,
    ...rest,
  }
}

export const useUpdateMe = (
  options?: UseMutationOptions<
    HttpTypes.AdminUserResponse,
    FetchError,
    StoreVendor,
    QueryKey
  >
) => {
  return useMutation({
    mutationFn: (body) =>
      fetchQuery("/vendor/sellers/me", {
        method: "POST",
        body,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.lists(),
      })

      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.me(),
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useOnboarding = () => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery("/vendor/sellers/me/onboarding", {
        method: "GET",
      }),
    queryKey: ["onboarding"],
    staleTime: 0,
  })

  return {
    ...data,
    ...rest,
  }
}

export const useUpdateOnboarding = () => {
  return useMutation({
    mutationFn: () =>
      fetchQuery("/vendor/sellers/me/onboarding", {
        method: "POST",
        body: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["onboarding"],
      })
    },
  })
}

export const useUserMe = (
  query?: HttpTypes.AdminUserParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminUserResponse,
      FetchError,
      HttpTypes.AdminUserResponse & {
        member: TeamMemberProps
      },
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery(`/vendor/me`, {
        method: "GET",
        query: query as { [key: string]: string | number },
      }),
    queryKey: [USERS_QUERY_KEY, "user", "me"],
    ...options,
  })

  return { ...data, ...rest }
}

export const useStatistics = ({ from, to }: { from: string; to: string }) => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery(
        `/vendor/statistics?time_from=${from}T00:00:00Z&time_to=${to}T23:59:59Z`,
        {
          method: "GET",
        }
      ),
    queryKey: [USERS_QUERY_KEY, "statistics", from, to],
  })

  return { ...data, ...rest }
}

export const useUser = (
  id: string,
  query?: HttpTypes.AdminUserParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminUserResponse,
      FetchError,
      HttpTypes.AdminUserResponse & {
        member: TeamMemberProps
      },
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery(`/vendor/members/${id}`, {
        method: "GET",
        query: query as { [key: string]: string | number },
      }),
    queryKey: usersQueryKeys.detail(id),
    ...options,
  })

  return { ...data, ...rest }
}

export const useUsers = (
  query?: HttpTypes.AdminUserListParams,
  options?: Omit<
    UseQueryOptions<
      HttpTypes.AdminUserListResponse,
      FetchError,
      HttpTypes.AdminUserListResponse & { members: any[] },
      QueryKey
    >,
    "queryFn" | "queryKey"
  >
) => {
  const { data, ...rest } = useQuery({
    queryFn: () =>
      fetchQuery("/vendor/members", {
        method: "GET",
        query: query as { [key: string]: string | number },
      }),
    queryKey: usersQueryKeys.list(query),
    ...options,
  })

  return { ...data, ...rest }
}

export const useUpdateUser = (
  id: string,
  options?: UseMutationOptions<
    TeamMemberProps,
    FetchError,
    {
      name?: string
      photo?: string
      language?: string
      phone?: string
      bio?: string
      metadata?: Record<string, unknown>
    },
    QueryKey
  >
) => {
  return useMutation({
    mutationFn: (body) =>
      fetchQuery(`/vendor/members/${id}`, {
        method: "POST",
        body,
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.lists(),
      })

      // We invalidate the me query in case the user updates their own profile
      queryClient.invalidateQueries({
        queryKey: [USERS_QUERY_KEY, "user", "me"],
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useDeleteUser = (
  id: string,
  options?: UseMutationOptions<
    HttpTypes.AdminUserDeleteResponse,
    FetchError,
    void
  >
) => {
  return useMutation({
    mutationFn: () =>
      fetchQuery(`/vendor/members/${id}`, {
        method: "DELETE",
      }),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.detail(id),
      })
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.lists(),
      })

      // We invalidate the me query in case the user updates their own profile
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.me(),
      })

      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
