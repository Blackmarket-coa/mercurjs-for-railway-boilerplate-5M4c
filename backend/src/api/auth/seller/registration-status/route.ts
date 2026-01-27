import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import { UseMutationOptions, useMutation } from "@tanstack/react-query"
import { clearAuthToken, fetchQuery, sdk, setAuthToken } from "../../lib/client"

/**
 * Sign in hook
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
      if (typeof result === "string") {
        setAuthToken(result)
      }
      return result
    },
    ...options,
  })
}

/**
 * Sign up hook (fixed)
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

      // Register the seller and get the token
      const token = await sdk.auth.register("seller", "emailpass", {
        ...authPayload,
        email: authPayload.email.toLowerCase().trim(),
      })

      if (typeof token === "string") {
        setAuthToken(token)
      }

      return token
    },
    ...options,
    onSuccess: async (token, variables, context) => {
      if (!token) return

      // Decode JWT to extract auth_identity_id
      let authIdentityId: string | null = null
      try {
        const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
        const paddedPayload = base64Payload + "=".repeat((4 - base64Payload.length % 4) % 4)
        const payloadObj = JSON.parse(Buffer.from(paddedPayload, "base64").toString("utf-8"))
        authIdentityId = payloadObj.auth_identity_id || payloadObj.sub || payloadObj.identity_id || payloadObj.user_id
      } catch (err) {
        console.error("Failed to decode JWT token:", err)
      }

      if (!authIdentityId) {
        console.warn("No auth_identity_id found from token, /vendor/register may not link correctly")
      }

      // Create seller registration request with auth_identity_id
      try {
        await fetchQuery("/vendor/register", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // include token
          },
          body: {
            name: variables.name,
            vendor_type: variables.vendor_type || "producer",
            auth_identity_id: authIdentityId,
            member: {
              name: variables.name,
              email: variables.email.toLowerCase().trim(),
            },
          },
        })
      } catch (error) {
        console.error("Failed to create seller registration request:", error)
      }

      // Call user-provided onSuccess if any
      options?.onSuccess?.(token, variables, context)
    },
  })
}

/**
 * Invite-based sign up
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
      if (typeof token === "string") {
        setAuthToken(token)
      }
      return token
    },
    ...options,
  })
}

/**
 * Reset password
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
 * Update password for EmailPass provider
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
