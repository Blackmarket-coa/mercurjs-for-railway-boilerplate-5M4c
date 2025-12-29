"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface RocketChatContextType {
  isConfigured: boolean
  rocketChatUrl: string | null
  unreadCount: number
}

const RocketChatContext = createContext<RocketChatContextType>({
  isConfigured: false,
  rocketChatUrl: null,
  unreadCount: 0,
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
}

export const RocketChatProvider = ({ children }: RocketChatProviderProps) => {
  const [unreadCount, setUnreadCount] = useState(0)
  
  const rocketChatUrl = typeof window !== "undefined" 
    ? (process.env.NEXT_PUBLIC_ROCKETCHAT_URL || null)
    : null
  const isConfigured = Boolean(rocketChatUrl)

  // Listen for messages from Rocket.Chat iframe for unread counts
  useEffect(() => {
    if (typeof window === "undefined") return

    const handleMessage = (event: MessageEvent) => {
      // Verify the origin matches our Rocket.Chat URL
      if (rocketChatUrl && event.origin === new URL(rocketChatUrl).origin) {
        if (event.data?.type === "unread-count") {
          setUnreadCount(event.data.count || 0)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [rocketChatUrl])

  return (
    <RocketChatContext.Provider
      value={{
        isConfigured,
        rocketChatUrl,
        unreadCount,
      }}
    >
      {children}
    </RocketChatContext.Provider>
  )
}
