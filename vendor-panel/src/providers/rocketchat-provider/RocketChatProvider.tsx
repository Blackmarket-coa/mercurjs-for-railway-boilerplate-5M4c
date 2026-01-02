import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"
import { useMe } from "../../hooks/api"

interface RocketChatContextType {
  isConfigured: boolean
  rocketChatUrl: string | null
  iframeUrl: string | null
  isLoading: boolean
  unreadCount: number
  seller: any
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

  useEffect(() => {
    // Get Rocket.Chat URL from environment
    const url = import.meta.env.VITE_ROCKETCHAT_URL
    if (url) {
      setIsConfigured(true)
      setRocketChatUrl(url)
      // Use seller-specific channel if available, otherwise home
      if (seller?.id) {
        // Seller channel name: vendor-{seller_handle or id}
        const sellerChannel = seller.handle || seller.id.replace('seller_', '')
        setIframeUrl(`${url}/channel/vendor-${sellerChannel}`)
      } else {
        setIframeUrl(`${url}/home`)
      }
    }
  }, [seller])

  // Listen for messages from Rocket.Chat iframe for unread count
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === rocketChatUrl && event.data?.type === 'unread-count') {
        setUnreadCount(event.data.count || 0)
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
        getChannelUrl,
        getDirectMessageUrl,
        getOrderChannelUrl,
      }}
    >
      {children}
    </RocketChatContext.Provider>
  )
}
