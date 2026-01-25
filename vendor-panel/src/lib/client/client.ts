import Medusa from "@medusajs/js-sdk"

// Prefer a runtime override when available so deployed static sites can be
// pointed at a different API without rebuilding. Set `window.__MEDUSA_BACKEND_URL__`
// on the page before the app bundle to override.
const runtimeBackend =
  typeof window !== "undefined" && (window as any).__MEDUSA_BACKEND_URL__
export const backendUrl = (runtimeBackend || __BACKEND_URL__) ?? "/"
export const publishableApiKey = __PUBLISHABLE_API_KEY__ ?? ""

export const getAuthToken = () => {
  return typeof window !== "undefined" ? window.localStorage.getItem("medusa_auth_token") || "" : ""
}

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("medusa_auth_token", token)
  }
}

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("medusa_auth_token")
  }
}

export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey: publishableApiKey,
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: "local",
  },
})

// useful when you want to call the BE from the console and try things out quickly
// Only expose in development to prevent security inspection in production
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  ;(window as any).__sdk = sdk
}

export const importProductsQuery = async (file: File) => {
  const formData = new FormData()
  formData.append("file", file)

  return await fetch(`${backendUrl}/vendor/products/import`, {
    method: "POST",
    body: formData,
    credentials: 'include',
    headers: {
      authorization: `Bearer ${getAuthToken()}`,
      "x-publishable-api-key": publishableApiKey,
    },
  })
    .then((res) => res.json())
    .catch(() => null)
}

export const uploadFilesQuery = async (files: any[]) => {
  const formData = new FormData()

  for (const { file } of files) {
    formData.append("files", file)
  }

  return await fetch(`${backendUrl}/vendor/uploads`, {
    method: "POST",
    body: formData,
    credentials: 'include',
    headers: {
      authorization: `Bearer ${getAuthToken()}`,
      "x-publishable-api-key": publishableApiKey,
    },
  })
    .then((res) => res.json())
    .catch(() => null)
}

export const fetchQuery = async (
  url: string,
  {
    method,
    body,
    query,
    headers,
  }: {
    method: "GET" | "POST" | "DELETE"
    body?: object
    query?: Record<string, string | number>
    headers?: { [key: string]: string }
  }
) => {
  const bearer = window.localStorage.getItem("medusa_auth_token") || ""
  const params = Object.entries(query || {}).reduce(
    (acc, [key, value], index) => {
      if (value && value !== undefined) {
        const queryLength = Object.values(query || {}).filter(
          (i) => i && i !== undefined
        ).length
        acc += `${key}=${value}${index + 1 <= queryLength ? "&" : ""}`
      }
      return acc
    },
    ""
  )
  const response = await fetch(`${backendUrl}${url}${params && `?${params}`}`, {
    method: method,
    credentials: 'include',
    headers: {
      authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableApiKey,
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  })

  if (!response.ok) {
    const errorData = await response.json()
    // Clear stale token on auth errors to prevent redirect loops
    if (response.status === 401 || response.status === 403) {
      clearAuthToken()
    }
    throw new Error(errorData.message || "Nieznany błąd serwera")
  }

  return response.json()
}
