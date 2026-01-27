import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import { UseMutationOptions, useMutation } from "@tanstack/react-query"
import { clearAuthToken, fetchQuery, sdk, setAuthToken } from "../../lib/client"

/**
 * Sign in with email/password
 */
export const useSignInWithEmailPass = (
  options?: UseMutationOptions<
    | string
    | { location: string },
    FetchError,
    HttpTypes.AdminSignUpWithEmailPassword
  >
) => {
  return useMutation({
    mutationFn: async (payload) => {
      const result = await sdk.auth.login("seller", "emailpass", {
        ...payload,
        email: payload.email.toLowerCase().trim(),
      })
      if (typeof result === "string") setAuthToken(result)
      return result
    },
    ...options,
  })
}

/**
 * Sign up with email/password and create vendor registration
 */
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
    mutationFn: async (payload) => {
      const { confirmPassword, vendor_type, ...authPayload } = payload

      const token = await sdk.auth.register("seller", "emailpass", {
        ...authPayload,
        email: payload.email.toLowerCase().trim(),
      })

      if (typeof token === "string") setAuthToken(token)
      return token
    },
    onSuccess: async (data, variables, context) => {
      try {
        // Ensure this endpoint uses the correct backend URL and auth token
        await fetchQuery("/vendor/register", {
          method: "POST",
          body: {
            name: variables.name,
            vendor_type: variables.vendor_type || "producer",
            member: {
              name: variables.name,
              email: variables.email.toLowerCase().trim(),
            },
          },
        })
      } catch (error) {
        console.error("Failed to create seller registration request:", error)
      }

      // Call user's onSuccess callback if provided
      options?.onSuccess?.(data, variables, context)
    },
    ...options,
  })
}

/**
 * Sign up for invite flow (no vendor type)
 */
export const useSignUpForInvite = (
  options?: UseMutationOptions<string, FetchError, HttpTypes.AdminSignInWithEmailPassword>
) => {
  return useMutation({
    mutationFn: async (payload) => {
      const token = await sdk.auth.register("seller", "emailpass", {
        ...payload,
        email: payload.email.toLowerCase().trim(),
      })
      if (typeof token === "string") setAuthToken(token)
      return token
    },
    ...options,
  })
}

/**
 * Reset password for email/password
 */
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

/**
 * Logout
 */
export const useLogout = (options?: UseMutationOptions<void, FetchError>) => {
  return useMutation({
    mutationFn: async () => {
      await sdk.auth.logout()
      clearAuthToken()
    },
    ...options,
  })
}

/**
 * Update provider password for email/password
 */
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
