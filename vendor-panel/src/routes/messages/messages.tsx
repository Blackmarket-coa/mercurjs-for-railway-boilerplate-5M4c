import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useRocketChat } from "../../providers/rocketchat-provider"
import { useRef, useEffect, useCallback, useState } from "react"

export const Messages = () => {
  const {
    isConfigured,
    iframeUrl,
    rocketChatUrl,
    unreadCount,
    seller,
    loginToken,
    loginUserId,
    getChannelUrl
  } = useRocketChat()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const loginAttemptedRef = useRef(false)
  const retryCountRef = useRef(0)

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

      loginAttemptedRef.current = true
      console.log('[RocketChat] Sent auto-login token to iframe (attempt', retryCountRef.current + 1, ')')
    } catch (error) {
      console.error('[RocketChat] Failed to send login token:', error)
    }
  }, [loginToken, loginUserId, rocketChatUrl, isLoggedIn])

  // Listen for messages from RocketChat iframe
  useEffect(() => {
    if (!rocketChatUrl) return

    const targetOrigin = new URL(rocketChatUrl).origin

    const handleMessage = (event: MessageEvent) => {
      // Only process messages from RocketChat origin
      if (event.origin !== targetOrigin) return

      // Debug: log all messages from RocketChat
      console.log('[RocketChat] Received message:', event.data)

      // Handle various RocketChat ready events (different versions use different names)
      const eventName = event.data?.eventName || event.data?.event
      if (eventName === 'startup' || eventName === 'ready' || eventName === 'Custom_Script_Loaded') {
        console.log('[RocketChat] Iframe ready event received:', eventName)
        handleIframeLogin()
      }

      // Handle successful login events
      if (eventName === 'login' || eventName === 'Custom_Script_Logged_In' ||
          event.data?.event === 'login-success' || event.data?.loggedIn === true) {
        setIsLoggedIn(true)
        console.log('[RocketChat] Auto-login successful')
      }

      // Handle user-info which indicates logged in state
      if (event.data?.eventName === 'user-info' && event.data?.data?.userId) {
        setIsLoggedIn(true)
        console.log('[RocketChat] User logged in:', event.data.data.userId)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [rocketChatUrl, handleIframeLogin])

  // Reset login state when token changes
  useEffect(() => {
    loginAttemptedRef.current = false
    retryCountRef.current = 0
    setIsLoggedIn(false)
  }, [loginToken])

  // Handle iframe load event - retry login multiple times
  const handleIframeLoad = useCallback(() => {
    // Try login at multiple intervals to handle slow RocketChat loading
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

  // Navigate to a channel using postMessage (preserves login state)
  const navigateToChannel = useCallback((channelName: string) => {
    if (!iframeRef.current || !rocketChatUrl) return

    try {
      const targetOrigin = new URL(rocketChatUrl).origin
      iframeRef.current.contentWindow?.postMessage({
        externalCommand: 'go',
        path: `/channel/${channelName}`
      }, targetOrigin)
    } catch (error) {
      // Fallback to direct URL change
      const url = getChannelUrl(channelName)
      if (iframeRef.current && url) {
        iframeRef.current.src = url
      }
    }
  }, [rocketChatUrl, getChannelUrl])

  // Quick links to common channels
  const quickLinks = [
    { label: "My Store", channelName: seller?.id ? `vendor-${seller.id}` : null },
    { label: "Support", channelName: "support" },
    { label: "General", channelName: "general" },
  ].filter(link => link.channelName)

  return (
    <Container className="divide-y p-0 min-h-[700px]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Heading>Messages</Heading>
          {unreadCount > 0 && (
            <Badge color="red" size="small">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Quick channel links */}
          {quickLinks.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              {quickLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (link.channelName) {
                      navigateToChannel(link.channelName)
                    }
                  }}
                  className="text-ui-fg-subtle hover:text-ui-fg-base transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
          {isConfigured && rocketChatUrl && (
            <a 
              href={rocketChatUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-ui-fg-interactive text-sm hover:underline"
            >
              Open in new tab
            </a>
          )}
        </div>
      </div>

      <div className="px-6 py-4 h-[655px]">
        {isConfigured && iframeUrl ? (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full border-0 rounded-lg"
            title="Rocket.Chat Messages"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="flex flex-col items-center w-full h-full justify-center">
            <Heading>No Chat Configured</Heading>
            <Text className="text-ui-fg-subtle mt-4" size="small">
              Rocket.Chat is not configured. Contact your administrator.
            </Text>
          </div>
        )}
      </div>
    </Container>
  )
}
