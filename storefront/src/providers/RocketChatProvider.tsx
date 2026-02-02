"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { getRocketChatConfig } from "@/lib/data/rocketchat"

interface RocketChatConfig {
  configured: boolean
  url?: string
  iframe_url?: string
  login?: {
    token: string
    username: string
  }
}

interface RocketChatContextType {
  isConfigured: boolean
  isLoading: boolean
  rocketChatUrl: string | null
  iframeUrl: string | null
  loginToken: string | null
  username: string | null
  unreadCount: number
  // Helper functions for messaging
  getChannelUrl: (channelName: string) => string | null
  getDirectMessageUrl: (username: string) => string | null
  getOrderChannelUrl: (orderId: string) => string | null
  getVendorChannelUrl: (vendorHandle: string) => string | null
  // Refresh config (e.g., after login)
  refreshConfig: () => Promise<void>
}

const RocketChatContext = createContext<RocketChatContextType>({
  isConfigured: false,
  isLoading: true,
  rocketChatUrl: null,
  iframeUrl: null,
  loginToken: null,
  username: null,
  unreadCount: 0,
  getChannelUrl: () => null,
  getDirectMessageUrl: () => null,
  getOrderChannelUrl: () => null,
  getVendorChannelUrl: () => null,
  refreshConfig: async () => {},
})

export const useRocketChat = () => {
  const context = useContext(RocketChatContext)
  if (!context) {
    throw new Error("useRocketChat must be used within a RocketChatProvider")
  }
  return context
}

interface RocketChatProviderProps {
  children: ReactNode
  // Optional: pre-fetched config from server component
  initialConfig?: RocketChatConfig | null
}

export const RocketChatProvider = ({ children, initialConfig }: RocketChatProviderProps) => {
  const [isLoading, setIsLoading] = useState(!initialConfig)
  const [isConfigured, setIsConfigured] = useState(initialConfig?.configured ?? false)
  const [rocketChatUrl, setRocketChatUrl] = useState<string | null>(initialConfig?.url ?? null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(initialConfig?.iframe_url ?? null)
  const [loginToken, setLoginToken] = useState<string | null>(initialConfig?.login?.token ?? null)
  const [username, setUsername] = useState<string | null>(initialConfig?.login?.username ?? null)
  const [unreadCount, setUnreadCount] = useState(0)

  // Function to fetch/refresh config
  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true)
      const config = await getRocketChatConfig()

      if (config && config.configured && config.url) {
        setIsConfigured(true)
        setRocketChatUrl(config.url)
        setIframeUrl(config.iframe_url || `${config.url}/home`)

        if (config.login) {
          setLoginToken(config.login.token)
          setUsername(config.login.username)
        }
      } else {
        // Fallback to env var if server fetch fails
        const fallbackUrl = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || null
        setIsConfigured(Boolean(fallbackUrl))
        setRocketChatUrl(fallbackUrl)
        setIframeUrl(fallbackUrl ? `${fallbackUrl}/home` : null)
      }
    } catch (error) {
      console.error("[RocketChatProvider] Failed to fetch config:", error)
      // Fallback to env var
      const fallbackUrl = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || null
      setIsConfigured(Boolean(fallbackUrl))
      setRocketChatUrl(fallbackUrl)
      setIframeUrl(fallbackUrl ? `${fallbackUrl}/home` : null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch config on mount if not provided
  useEffect(() => {
    if (!initialConfig) {
      fetchConfig()
    }
  }, [initialConfig, fetchConfig])

  // Listen for messages from Rocket.Chat iframe for unread counts
  useEffect(() => {
    if (!rocketChatUrl) return

    const handleMessage = (event: MessageEvent) => {
      try {
        // Verify the origin matches our Rocket.Chat URL
        if (rocketChatUrl && event.origin === new URL(rocketChatUrl).origin) {
          if (event.data?.type === "unread-count") {
            setUnreadCount(event.data.count || 0)
          }
        }
      } catch (error) {
        // Ignore origin parsing errors
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [rocketChatUrl])

  // Helper function to get a specific channel URL
  const getChannelUrl = useCallback((channelName: string) => {
    if (!rocketChatUrl) return null
    return `${rocketChatUrl}/channel/${channelName}`
  }, [rocketChatUrl])

  // Helper function to get direct message URL
  const getDirectMessageUrl = useCallback((targetUsername: string) => {
    if (!rocketChatUrl) return null
    return `${rocketChatUrl}/direct/${targetUsername}`
  }, [rocketChatUrl])

  // Helper function to get order-specific channel URL
  const getOrderChannelUrl = useCallback((orderId: string) => {
    if (!rocketChatUrl) return null
    const cleanOrderId = orderId.replace("order_", "")
    return `${rocketChatUrl}/channel/order-${cleanOrderId}`
  }, [rocketChatUrl])

  // Helper function to get vendor channel URL
  const getVendorChannelUrl = useCallback((vendorHandle: string) => {
    if (!rocketChatUrl) return null
    return `${rocketChatUrl}/channel/vendor-${vendorHandle}`
  }, [rocketChatUrl])

  return (
    <RocketChatContext.Provider
      value={{
        isConfigured,
        isLoading,
        rocketChatUrl,
        iframeUrl,
        loginToken,
        username,
        unreadCount,
        getChannelUrl,
        getDirectMessageUrl,
        getOrderChannelUrl,
        getVendorChannelUrl,
        refreshConfig: fetchConfig,
      }}
    >
      {children}
    </RocketChatContext.Provider>
  )
}
