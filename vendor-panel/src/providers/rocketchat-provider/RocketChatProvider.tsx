import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useMe } from "../../hooks/api"

interface RocketChatContextType {
  isConfigured: boolean
  rocketChatUrl: string | null
  iframeUrl: string | null
  isLoading: boolean
  unreadCount: number
  seller: any
}

const RocketChatContext = createContext<RocketChatContextType>({
  isConfigured: false,
  rocketChatUrl: null,
  iframeUrl: null,
  isLoading: true,
  unreadCount: 0,
  seller: null,
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
      setIframeUrl(`${url}/channel/general`)
    }
  }, [])

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
      }}
    >
      {children}
    </RocketChatContext.Provider>
  )
}
