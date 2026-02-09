import Medusa from "@medusajs/js-sdk"
import { devLogger } from "../logger"

// PUBLIC ROUTE CHECKER
export const isPublicAuthRoute = (url: string) => {
  return (
    url.startsWith("/auth/") ||
    url.startsWith("/vendor/auth")
  )
}

// BACKEND CONFIG
const isBrowser = typeof window !== "undefined"
const runtimeBackend = isBrowser && (window as any).__MEDUSA_BACKEND_URL__
export const backendUrl = (runtimeBackend || __BACKEND_URL__) ?? "/"
export const publishableApiKey = __PUBLISHABLE_API_KEY__ ?? ""
const publishableHeader = publishableApiKey
  ? { "x-publishable-api-key": publishableApiKey }
  : {}

// AUTH TOKEN STORAGE
export const getAuthToken = () =>
  isBrowser
    ? window.localStorage.getItem("medusa_auth_token") || ""
    : ""

export const getAuthTokenPayload = (): Record<string, unknown> | null => {
  if (!isBrowser) {
    return null
  }

  const token = getAuthToken()
  if (!token) {
    return null
  }

  try {
    const tokenParts = token.split(".")
    if (tokenParts.length < 2) {
      return null
    }

    const payload = tokenParts[1]
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const padded = normalized + "===".slice((normalized.length + 3) % 4)
    const decoded = window.atob(padded)

    return JSON.parse(decoded) as Record<string, unknown>
  } catch (error) {
    if (import.meta.env.DEV) {
      devLogger.warn("Failed to decode auth token payload:", error)
    }
    return null
  }
}

export const setAuthToken = (token: string) => {
  if (isBrowser) {
    window.localStorage.setItem("medusa_auth_token", token)
  }
}

export const clearAuthToken = () => {
  if (isBrowser) {
    window.localStorage.removeItem("medusa_auth_token")
  }
}

// MEDUSA SDK INSTANCE
export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey: publishableApiKey,
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: "local",
  },
})

export const publicAuthSdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey: publishableApiKey,
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: "memory",
  },
})

// Expose SDK in dev for console experimentation
if (process.env.NODE_ENV === "development" && isBrowser) {
  ;(window as any).__sdk = sdk
}

// UPLOAD FILES
export const uploadFilesQuery = async (files: any[]) => {
  const formData = new FormData()
  for (const { file } of files) formData.append("files", file)

  return await fetchQuery("/vendor/uploads", {
    method: "POST",
    body: formData,
    isForm: true,
  })
}

// IMPORT PRODUCTS
export const importProductsQuery = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  return await fetchQuery("/vendor/products/import", {
    method: "POST",
    body: formData,
    isForm: true,
  })
}

// FETCH QUERY WRAPPER
export const fetchQuery = async (
  url: string,
  {
    method,
    body,
    query,
    headers,
    isForm,
  }: {
    method: "GET" | "POST" | "DELETE"
    body?: object | FormData
    query?: Record<string, string | number>
    headers?: Record<string, string>
    isForm?: boolean
  }
) => {
  const isPublic = isPublicAuthRoute(url)
  const token = getAuthToken()

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null) {
      params.set(key, String(value))
    }
  }
  const queryString = params.toString()

  const requestUrl = `${backendUrl}${url}${queryString ? `?${queryString}` : ""}`
  const authHeaders = isPublic
    ? {}
    : token
      ? { Authorization: `Bearer ${token}` }
      : {}

  const response = await fetch(requestUrl, {
    method,
    credentials: isPublic ? "omit" : "include",
    headers: {
      ...authHeaders,
      ...publishableHeader,
      ...(!isForm && { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body && !isForm ? JSON.stringify(body) : body,
  })

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || ""
    const errorData = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : {}
    const errorText = !contentType.includes("application/json")
      ? await response.text().catch(() => "")
      : ""
    const errorContext = `${method} ${url} (${response.status} ${response.statusText})`
    if (!isPublic && response.status === 401) {
      clearAuthToken()
    }
    const baseMessage =
      errorData.message || errorText || "Unknown server error"
    throw new Error(`${baseMessage} (${errorContext})`)
  }

  return response.json()
}
