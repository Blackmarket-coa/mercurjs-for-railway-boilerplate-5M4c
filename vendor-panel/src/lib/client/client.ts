import Medusa from "@medusajs/js-sdk"

const isPublicAuthRoute = (url: string) => {
  return (
    url.startsWith("/vendor/register") ||
    url.startsWith("/auth/") ||
    url.startsWith("/vendor/auth")
  )
}

// Prefer runtime override for deployed static sites
const runtimeBackend =
  typeof window !== "undefined" && (window as any).__MEDUSA_BACKEND_URL__
export const backendUrl = (runtimeBackend || __BACKEND_URL__) ?? "/"
export const publishableApiKey = __PUBLISHABLE_API_KEY__ ?? ""

export const getAuthToken = () =>
  typeof window !== "undefined"
    ? window.localStorage.getItem("medusa_auth_token") || ""
    : ""

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

// Expose SDK in dev for console testing
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  ;(window as any).__sdk = sdk
}

// Product import
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

// File upload
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

// Unified fetchQuery for public and authenticated routes
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
  const isPublic = isPublicAuthRoute(url)
  const bearer = getAuthToken()

  // Build query string
  const params = Object.entries(query || {})
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")

  const response = await fetch(`${backendUrl}${url}${params ? `?${params}` : ""}`, {
    method,
    credentials: 'include',
    headers: {
      ...(isPublic
        ? {}
        : {
            authorization: `Bearer ${bearer}`,
            "x-publishable-api-key": publishableApiKey,
          }),
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : null,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    if (!isPublic && (response.status === 401 || response.status === 403)) {
      clearAuthToken()
    }
    throw new Error(errorData?.message || "Nieznany błąd serwera")
  }

  return response.json()
}
