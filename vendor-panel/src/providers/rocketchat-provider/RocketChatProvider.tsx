import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useMe } from "../../hooks/api"
import { sdk } from "../../lib/client"

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
  rocketChatUrl: string | null
  iframeUrl: string | null
  isLoading: boolean
  unreadCount: number
  seller: any
  loginToken: string | null
  username: string | null
  // Helper functions for messaging
  getChannelUrl: (channelName: string) => string | null
  getDirectMessageUrl: (username: string) => string | null
  getOrderChannelUrl: (orderId: string) => string | null
}

const RocketChatContext = createContext<RocketChatContextType>({
  isConfigured: false,
  rocketChatUrl: null,
  iframeUrl: null,
  isLoading: true,
  unreadCount: 0,
  seller: null,
  loginToken: null,
  username: null,
  getChannelUrl: () => null,
  getDirectMessageUrl: () => null,
  getOrderChannelUrl: () => null,
})

export const useRocketChat = () => useContext(RocketChatContext)

export const RocketChatProvider = ({ children }: { children: ReactNode }) => {
  const { seller, isPending } = useMe()
  const [isConfigured, setIsConfigured] = useState(false)
  const [rocketChatUrl, setRocketChatUrl] = useState<string | null>(null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loginToken, setLoginToken] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    // Fetch Rocket.Chat configuration from backend
    const fetchRocketChatConfig = async () => {
      try {
        const response = await sdk.client.fetch<RocketChatConfig>("/vendor/rocketchat", {
          method: "GET",
        })

        if (response.configured && response.url) {
          setIsConfigured(true)
          setRocketChatUrl(response.url)
          setIframeUrl(response.iframe_url || `${response.url}/home`)

          // Store login credentials if provided
          if (response.login) {
            setLoginToken(response.login.token)
            setUsername(response.login.username)
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch RocketChat config:", error)
        }
        setIsConfigured(false)
      }
    }

    if (!isPending && seller) {
      fetchRocketChatConfig()
    }
  }, [seller, isPending])

  // Listen for messages from Rocket.Chat iframe for unread count
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (rocketChatUrl && event.origin === new URL(rocketChatUrl).origin) {
        if (event.data?.type === 'unread-count') {
          setUnreadCount(event.data.count || 0)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [rocketChatUrl])

  // Helper function to get a specific channel URL
  const getChannelUrl = useCallback((channelName: string) => {
    if (!rocketChatUrl) return null
    return `${rocketChatUrl}/channel/${channelName}`
  }, [rocketChatUrl])

  // Helper function to get direct message URL
  const getDirectMessageUrl = useCallback((username: string) => {
    if (!rocketChatUrl) return null
    return `${rocketChatUrl}/direct/${username}`
  }, [rocketChatUrl])

  // Helper function to get order-specific channel URL
  const getOrderChannelUrl = useCallback((orderId: string) => {
    if (!rocketChatUrl) return null
    // Order channels use format: order-{order_id}
    const cleanOrderId = orderId.replace('order_', '')
    return `${rocketChatUrl}/channel/order-${cleanOrderId}`
  }, [rocketChatUrl])

  if (isPending) {
    return <div className="flex justify-center items-center h-screen" />
  }

  return (
    <RocketChatContext.Provider
      value={{
        isConfigured,
        rocketChatUrl,
        iframeUrl,
        isLoading: isPending,
        unreadCount,
        seller,
        loginToken,
        username,
        getChannelUrl,
        getDirectMessageUrl,
        getOrderChannelUrl,
      }}
    >
      {children}
    </RocketChatContext.Provider>
  )
}
