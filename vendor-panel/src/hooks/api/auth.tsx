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
      const { confirmPassword, vendor_type, ...authPayload } = payload as any

      return sdk.auth.register("seller", "emailpass", {
        ...authPayload,
        email: payload.email.toLowerCase().trim(),
      })
    },
    // Spread options first so internal onSuccess isn't overwritten
    ...options,
    onSuccess: async (data, variables, context) => {
      const normalizedEmail = variables.email.toLowerCase().trim()

      // Create seller registration request with vendor type
      // Wrap in try/catch to prevent uncaught fetch errors
      try {
        await fetchQuery("/vendor/sellers", {
          method: "POST",
          body: {
            name: variables.name,
            vendor_type: variables.vendor_type || "producer",
            member: {
              name: variables.name,
              email: normalizedEmail,
            },
          },
        })
      } catch (error) {
        // Log the error but don't block registration success
        // The seller profile can be created later if this fails
        console.error("Failed to create seller profile:", error)
      }

      // Call user's onSuccess callback if provided
      options?.onSuccess?.(data, variables, context)
    },
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
    ...options,
  })
}
