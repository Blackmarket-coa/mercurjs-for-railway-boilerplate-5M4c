import Medusa from "@medusajs/js-sdk"
import type { NextFetchRequestConfig } from "next/dist/server/config-shared"

// Defaults to standard port for Medusa server
const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || ""

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

// Validate required environment variables
if (!MEDUSA_BACKEND_URL) {
  throw new Error(
    "MEDUSA_BACKEND_URL is required. Please set it in your environment variables."
  )
}

if (!PUBLISHABLE_KEY) {
  throw new Error(
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is required. Please set it in your environment variables."
  )
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: PUBLISHABLE_KEY,
})

type FetchQueryOptions = Omit<RequestInit, "headers" | "body"> & {
  headers?: Record<string, string | null | { tags: string[] }>
  query?: Record<string, string | number>
  body?: Record<string, any>
}

type MedusaFetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string | undefined>
  query?: Record<string, string | number | string[] | undefined>
  next?: NextFetchRequestConfig
}

/**
 * Custom fetch wrapper that ensures x-publishable-api-key header is always sent
 * Use this instead of sdk.client.fetch to guarantee the header is present
 */
export async function medusaFetch<T>(
  path: string,
  options: MedusaFetchOptions = {}
): Promise<T> {
  const { headers = {}, ...restOptions } = options

  return sdk.client.fetch<T>(path, {
    ...restOptions,
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
      ...headers,
    },
  })
}

export async function fetchQuery(
  url: string,
  { method, query, headers, body }: FetchQueryOptions
) {
  const params = Object.entries(query || {}).reduce(
    (acc, [key, value], index) => {
      if (value && value !== undefined) {
        const queryLength = Object.values(query || {}).filter((i) => !!i).length
        acc += `${key}=${value}${index + 1 <= queryLength ? "&" : ""}`
      }
      return acc
    },
    ""
  )

  const res = await fetch(
    `${MEDUSA_BACKEND_URL}${url}${params && `?${params}`}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env
          .NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY as string,
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
    }
  )

  let data
  try {
    data = await res.json()
  } catch {
    data = { message: res.statusText || "Unknown error" }
  }

  return {
    ok: res.ok,
    status: res.status,
    error: res.ok ? null : { message: data?.message },
    data: res.ok ? data : null,
  }
}
