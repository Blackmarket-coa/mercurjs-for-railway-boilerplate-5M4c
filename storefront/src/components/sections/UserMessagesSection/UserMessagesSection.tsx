"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRocketChat } from "@/providers/RocketChatProvider"

interface UserMessagesSectionProps {
  // Optional: specific channel to open (e.g., for vendor or order messaging)
  channelName?: string
  // Optional: direct message to a specific user
  directMessageUser?: string
}

export const UserMessagesSection = ({
  channelName,
  directMessageUser
}: UserMessagesSectionProps = {}) => {
  const {
    isConfigured,
    isLoading,
    rocketChatUrl,
    iframeUrl: defaultIframeUrl,
    loginToken,
    getChannelUrl,
    getDirectMessageUrl,
  } = useRocketChat()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const loginAttemptedRef = useRef(false)

  // Build the appropriate URL based on props
  let iframeUrl = defaultIframeUrl
  if (directMessageUser && rocketChatUrl) {
    iframeUrl = getDirectMessageUrl(directMessageUser)
  } else if (channelName && rocketChatUrl) {
    iframeUrl = getChannelUrl(channelName)
  }

  // Auto-login to RocketChat via postMessage when iframe loads
  const handleIframeLogin = useCallback(() => {
    if (!iframeRef.current || !loginToken || !rocketChatUrl || loginAttemptedRef.current) return

    try {
      const iframe = iframeRef.current
      const targetOrigin = new URL(rocketChatUrl).origin

      // Send login-with-token message to RocketChat iframe
      iframe.contentWindow?.postMessage({
        externalCommand: "login-with-token",
        token: loginToken
      }, targetOrigin)

      loginAttemptedRef.current = true
      console.log("[RocketChat] Sent auto-login token to iframe")
    } catch (error) {
      console.error("[RocketChat] Failed to send login token:", error)
    }
  }, [loginToken, rocketChatUrl])

  // Listen for messages from RocketChat iframe
  useEffect(() => {
    if (!rocketChatUrl) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const targetOrigin = new URL(rocketChatUrl).origin
        if (event.origin !== targetOrigin) return

        // Handle RocketChat ready event
        if (event.data?.eventName === "startup") {
          console.log("[RocketChat] Iframe ready, attempting auto-login")
          handleIframeLogin()
        }

        // Handle successful login
        if (event.data?.eventName === "login") {
          setIsLoggedIn(true)
          console.log("[RocketChat] Auto-login successful")
        }
      } catch (error) {
        // Ignore origin parsing errors
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [rocketChatUrl, handleIframeLogin])

  // Reset login state when token changes
  useEffect(() => {
    loginAttemptedRef.current = false
    setIsLoggedIn(false)
  }, [loginToken])

  // Handle iframe load event as fallback
  const handleIframeLoad = useCallback(() => {
    // Small delay to ensure RocketChat is fully loaded
    setTimeout(() => {
      if (!loginAttemptedRef.current) {
        handleIframeLogin()
      }
    }, 1000)
  }, [handleIframeLogin])

  // Navigate to a channel using postMessage (preserves login state)
  const navigateToChannel = useCallback((targetChannelName: string) => {
    if (!iframeRef.current || !rocketChatUrl) return

    try {
      const targetOrigin = new URL(rocketChatUrl).origin
      iframeRef.current.contentWindow?.postMessage({
        externalCommand: "go",
        path: `/channel/${targetChannelName}`
      }, targetOrigin)
    } catch (error) {
      // Fallback to direct URL change
      const url = getChannelUrl(targetChannelName)
      if (iframeRef.current && url) {
        iframeRef.current.src = url
      }
    }
  }, [rocketChatUrl, getChannelUrl])

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-full h-[655px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm mt-4">Loading chat...</p>
        </div>
      </div>
    )
  }

  if (!isConfigured || !rocketChatUrl) {
    return (
      <div className="max-w-full h-[655px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Chat is not configured</p>
          <p className="text-sm mt-2">Please contact support for assistance.</p>
        </div>
      </div>
    )
  }

  // Quick links to common channels
  const quickLinks = [
    { label: "Support", channelName: "support" },
    { label: "General", channelName: "general" },
  ]

  return (
    <div className={`max-w-full ${isFullscreen ? "fixed inset-0 z-50 bg-white" : "h-[655px]"}`}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Messages</h2>
          {isLoggedIn && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              Connected
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Quick channel links */}
          <div className="flex items-center gap-2 text-sm">
            {quickLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => navigateToChannel(link.channelName)}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-sm text-primary hover:underline"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <a
            href={rocketChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
      <iframe
        ref={iframeRef}
        src={iframeUrl || `${rocketChatUrl}/home`}
        title="Messages"
        className={`w-full border-0 rounded-lg ${isFullscreen ? "h-[calc(100vh-60px)]" : "h-[600px]"}`}
        allow="camera; microphone; fullscreen; display-capture; autoplay"
        onLoad={handleIframeLoad}
      />
    </div>
  )
}

// Helper function to get vendor channel URL (for use outside the component)
export const getVendorChannelUrl = (vendorHandle: string) => {
  const rocketChatUrl = process.env.NEXT_PUBLIC_ROCKETCHAT_URL
  if (!rocketChatUrl) return null
  return `${rocketChatUrl}/channel/vendor-${vendorHandle}`
}

// Helper function to get order channel URL (for use outside the component)
export const getOrderChannelUrl = (orderId: string) => {
  const rocketChatUrl = process.env.NEXT_PUBLIC_ROCKETCHAT_URL
  if (!rocketChatUrl) return null
  const cleanOrderId = orderId.replace("order_", "")
  return `${rocketChatUrl}/channel/order-${cleanOrderId}`
}
