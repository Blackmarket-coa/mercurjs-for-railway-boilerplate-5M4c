"use server"

import { medusaFetch } from "../config"
import { getAuthHeaders } from "./cookies"

interface RocketChatConfig {
  configured: boolean
  url?: string
  iframe_url?: string
  login?: {
    token: string
    username: string
  }
  message?: string
}

/**
 * Fetch Rocket.Chat configuration for the authenticated customer
 * Returns config with login token for auto-login
 */
export async function getRocketChatConfig(): Promise<RocketChatConfig | null> {
  try {
    const authHeaders = await getAuthHeaders()
    if (!authHeaders) {
      return null
    }

    const config = await medusaFetch<RocketChatConfig>("/store/rocketchat", {
      method: "GET",
      headers: authHeaders,
      cache: "no-store", // Never cache auth-related data
    })

    return config
  } catch (error) {
    console.error("[getRocketChatConfig] Error:", error)
    return null
  }
}
