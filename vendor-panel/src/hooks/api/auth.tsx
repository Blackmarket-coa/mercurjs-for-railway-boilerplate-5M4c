import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import { UseMutationOptions, useMutation } from "@tanstack/react-query"
import { fetchQuery, sdk } from "../../lib/client"

export const useSignInWithEmailPass = (
  options?: UseMutationOptions<
    | string
    | {
        location: string
      },
    FetchError,
    HttpTypes.AdminSignUpWithEmailPassword
  >
) => {
  return useMutation({
    mutationFn: (payload) =>
      sdk.auth.login("seller", "emailpass", {
        ...payload,
        email: payload.email.toLowerCase().trim(),
      }),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useSignUpWithEmailPass = (
  options?: UseMutationOptions<
    string,
    FetchError,
    HttpTypes.AdminSignInWithEmailPassword & {
      confirmPassword: string
      name: string
      vendor_type?: string
    }
  >
) => {
  return useMutation({
    mutationFn: (payload) => {
      // Strip fields not accepted by auth.register
      const { vendor_type, confirmPassword, ...authPayload } = payload as any

      return sdk.auth.register("seller", "emailpass", {
        ...authPayload,
        email: payload.email.toLowerCase().trim(),
      })
    },

    onSuccess: async (_, variables) => {
      const normalizedEmail = variables.email.toLowerCase().trim()

      // Create seller with vendor_type stored safely in metadata
      await fetchQuery("/vendor/sellers", {
        method: "POST",
        body: {
          name: variables.name,
          metadata: {
            vendor_type: variables.vendor_type || "producer",
          },
          member: {
            name: variables.name,
            email: normalizedEmail,
          },
        },
      })

      options?.onSuccess?.(_, variables, undefined as any)
    },

    ...options,
  })
}

export const useSignUpForInvite = (
  options?: UseMutationOptions<
    string,
    FetchError,
    HttpTypes.AdminSignInWithEmailPassword
  >
) => {
  return useMutation({
    mutationFn: (payload) =>
      sdk.auth.register("seller", "emailpass", {
        ...payload,
        email: payload.email.toLowerCase().trim(),
      }),
    ...options,
  })
}

export const useResetPasswordForEmailPass = (
  options?: UseMutationOptions<void, FetchError, { email: string }>
) => {
  return useMutation({
    mutationFn: (payload) =>
      sdk.auth.resetPassword("seller", "emailpass", {
        identifier: payload.email.toLowerCase().trim(),
      }),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

export const useLogout = (options?: UseMutationOptions<void, FetchError>) => {
  return useMutation({
    mutationFn: () => sdk.auth.logout(),
    ...options,
  })
}

export const useUpdateProviderForEmailPass = (
  token: string,
  options?: UseMutationOptions<void, FetchError, { password: string }>
) => {
  return useMutation({
    mutationFn: (payload) =>
      sdk.auth.updateProvider("seller", "emailpass", payload, token),
    onSuccess: async (data, variables, context) => {
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}
