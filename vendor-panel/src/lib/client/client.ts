import Medusa from "@medusajs/js-sdk"

// PUBLIC ROUTE CHECKER
export const isPublicAuthRoute = (url: string) => {
  return (
    url.startsWith("/auth/") ||
    url.startsWith("/vendor/auth")
  )
}

// BACKEND CONFIG
const runtimeBackend =
  typeof window !== "undefined" && (window as any).__MEDUSA_BACKEND_URL__
export const backendUrl = (runtimeBackend || __BACKEND_URL__) ?? "/"
export const publishableApiKey = __PUBLISHABLE_API_KEY__ ?? ""

// AUTH TOKEN STORAGE
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
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
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

  if (!isPublic && !token) {
    clearAuthToken()
    throw new Error("Brak autoryzacji. Zaloguj się ponownie.")
  }

  const params = Object.entries(query || {})
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&")

  const requestUrl = `${backendUrl}${url}${params ? `?${params}` : ""}`

  const response = await fetch(requestUrl, {
    method,
    credentials: isPublic ? "omit" : "include",
    headers: {
      ...(isPublic
        ? {
            ...(publishableApiKey ? { "x-publishable-api-key": publishableApiKey } : {}),
          }
        : {
            ...(token ? { authorization: `Bearer ${token}` } : {}),
            ...(publishableApiKey ? { "x-publishable-api-key": publishableApiKey } : {}),
          }),
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
    if (!isPublic && (response.status === 401 || response.status === 403)) {
      clearAuthToken()
    }
    const baseMessage = errorData.message || errorText || "Nieznany błąd serwera"
    throw new Error(`${baseMessage} (${errorContext})`)
  }

  return response.json()
}
