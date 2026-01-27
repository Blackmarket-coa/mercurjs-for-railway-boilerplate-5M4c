import { FetchError } from "@medusajs/js-sdk"
import { HttpTypes } from "@medusajs/types"
import { UseMutationOptions, useMutation } from "@tanstack/react-query"
import {
  backendUrl,
  clearAuthToken,
  fetchQuery,
  getAuthToken,
  sdk,
  setAuthToken,
} from "../../lib/client"

const fetchRegistrationStatus = async (token: string) => {
  const response = await fetch(`${backendUrl}/auth/seller/registration-status`, {
    method: "GET",
    credentials: "include",
    headers: {
      authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  return response.json() as Promise<{
    status: string
    message: string
    request_id?: string
    seller_id?: string
  }>
}

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
      const result = await publicAuthSdk.auth.login("seller", "emailpass", {
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
      const normalizedEmail = payload.email.toLowerCase().trim()

      try {
        const token = await sdk.auth.register("seller", "emailpass", {
          ...authPayload,
          email: normalizedEmail,
        })

        if (typeof token === "string") setAuthToken(token)
        return token
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Registration failed"
        const status =
          error instanceof FetchError ? error.status : undefined

        if (status === 409 || message.toLowerCase().includes("already exists")) {
          const result = await sdk.auth.login("seller", "emailpass", {
            ...authPayload,
            email: normalizedEmail,
          })
          if (typeof result === "string") {
            setAuthToken(result)
            return result
          }
        }

        throw error
      }
    },
    onSuccess: async (data, variables, context) => {
      try {
        const token = typeof data === "string" ? data : getAuthToken()
        if (token) {
          const status = await fetchRegistrationStatus(token)
          if (status.status === "pending" || status.status === "approved") {
            options?.onSuccess?.(data, variables, context)
            return
          }
        }

        await fetchQuery("/auth/seller/register-request", {
          method: "POST",
          body: {
            name: variables.name,
            vendor_type: variables.vendor_type || "producer",
            member: {
              name: variables.name,
              email: variables.email.toLowerCase().trim(),
            },
          },
          headers: token ? { authorization: `Bearer ${token}` } : undefined,
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
      const token = await publicAuthSdk.auth.register("seller", "emailpass", {
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
