import { ChatBubble } from "@medusajs/icons"
import { Drawer, Heading, IconButton, Text } from "@medusajs/ui"
import { useState, useRef, useEffect, useCallback } from "react"
import { useMe } from "../../../hooks/api"
import { useRocketChat } from "../../../providers/rocketchat-provider"

export const AdminChat = () => {
  const [open, setOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const retryCountRef = useRef(0)

  const { seller, isPending } = useMe()
  const { isConfigured, rocketChatUrl, loginToken, loginUserId } = useRocketChat()

  // Auto-login to RocketChat via postMessage when iframe loads
  const handleIframeLogin = useCallback(() => {
    if (!iframeRef.current || !loginToken || !rocketChatUrl) return
    if (isLoggedIn) return // Already logged in

    try {
      const iframe = iframeRef.current
      const targetOrigin = new URL(rocketChatUrl).origin

      // Try Method 1: login-with-token (standard postMessage command)
      iframe.contentWindow?.postMessage({
        externalCommand: 'login-with-token',
        token: loginToken
      }, targetOrigin)

      // Try Method 2: If we have userId, also try the call method for Meteor login
      if (loginUserId) {
        iframe.contentWindow?.postMessage({
          externalCommand: 'call',
          method: 'login',
          params: [{ resume: loginToken }]
        }, targetOrigin)
      }

      // Try Method 3: Set credentials via setCredentials command (some RC versions)
      if (loginUserId) {
        iframe.contentWindow?.postMessage({
          event: 'login-with-token',
          loginToken: loginToken,
          userId: loginUserId
        }, targetOrigin)
      }

      console.log('[RocketChat] Admin chat: Sent auto-login token (attempt', retryCountRef.current + 1, ')')
    } catch (error) {
      console.error('[RocketChat] Admin chat: Failed to send login token:', error)
    }
  }, [loginToken, loginUserId, rocketChatUrl, isLoggedIn])

  // Listen for messages from RocketChat iframe
  useEffect(() => {
    if (!rocketChatUrl || !open) return

    const targetOrigin = new URL(rocketChatUrl).origin

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return

      // Debug: log all messages from RocketChat
      console.log('[RocketChat] Admin chat received message:', event.data)

      // Handle various RocketChat ready events
      const eventName = event.data?.eventName || event.data?.event
      if (eventName === 'startup' || eventName === 'ready' || eventName === 'Custom_Script_Loaded') {
        console.log('[RocketChat] Admin chat: Iframe ready event received:', eventName)
        handleIframeLogin()
      }

      // Handle successful login events
      if (eventName === 'login' || eventName === 'Custom_Script_Logged_In' ||
          event.data?.event === 'login-success' || event.data?.loggedIn === true) {
        setIsLoggedIn(true)
        console.log('[RocketChat] Admin chat: Auto-login successful')
      }

      // Handle user-info which indicates logged in state
      if (event.data?.eventName === 'user-info' && event.data?.data?.userId) {
        setIsLoggedIn(true)
        console.log('[RocketChat] Admin chat: User logged in')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [rocketChatUrl, handleIframeLogin, open])

  // Reset login state when drawer closes or token changes
  useEffect(() => {
    if (!open) {
      retryCountRef.current = 0
      setIsLoggedIn(false)
    }
  }, [open, loginToken])

  // Handle iframe load event - retry login multiple times
  const handleIframeLoad = useCallback(() => {
    // Try login at multiple intervals
    const delays = [500, 1500, 3000, 5000]

    delays.forEach((delay, index) => {
      setTimeout(() => {
        if (!isLoggedIn) {
          retryCountRef.current = index + 1
          handleIframeLogin()
        }
      }, delay)
    })
  }, [handleIframeLogin, isLoggedIn])

  if (isPending)
    return <div className="flex justify-center items-center h-screen" />

  const handleOnOpen = (shouldOpen: boolean) => {
    if (shouldOpen) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }

  // Build iframe URL with channel parameter for admin chat
  const adminChatUrl = rocketChatUrl
    ? `${rocketChatUrl}/channel/admin-vendor-${seller?.id}`
    : ""

  return (
    <Drawer open={open} onOpenChange={handleOnOpen}>
      <Drawer.Trigger asChild>
        <IconButton
          variant="transparent"
          className="text-ui-fg-muted hover:text-ui-fg-subtle"
        >
          <ChatBubble />
        </IconButton>
      </Drawer.Trigger>
      <Drawer.Content>
        <Drawer.Header>
          <Drawer.Title asChild>
            <Heading>Chat with admin</Heading>
          </Drawer.Title>
        </Drawer.Header>
        <Drawer.Body className="overflow-y-auto px-4">
          {isConfigured ? (
            <iframe
              ref={iframeRef}
              src={adminChatUrl}
              title="Admin Chat"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="camera; microphone; fullscreen; display-capture"
              onLoad={handleIframeLoad}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ChatBubble className="w-12 h-12 text-ui-fg-muted mb-4" />
              <Text className="text-ui-fg-muted">
                Chat is not configured. Please set VITE_ROCKETCHAT_URL in your environment.
              </Text>
            </div>
          )}
        </Drawer.Body>
      </Drawer.Content>
    </Drawer>
  )
}
