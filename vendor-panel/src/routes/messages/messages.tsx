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
    getChannelUrl
  } = useRocketChat()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const loginAttemptedRef = useRef(false)

  // Auto-login to RocketChat via postMessage when iframe loads
  const handleIframeLogin = useCallback(() => {
    if (!iframeRef.current || !loginToken || !rocketChatUrl || loginAttemptedRef.current) return

    try {
      const iframe = iframeRef.current
      const targetOrigin = new URL(rocketChatUrl).origin

      // Send login-with-token message to RocketChat iframe
      iframe.contentWindow?.postMessage({
        externalCommand: 'login-with-token',
        token: loginToken
      }, targetOrigin)

      loginAttemptedRef.current = true
      console.log('[RocketChat] Sent auto-login token to iframe')
    } catch (error) {
      console.error('[RocketChat] Failed to send login token:', error)
    }
  }, [loginToken, rocketChatUrl])

  // Listen for messages from RocketChat iframe
  useEffect(() => {
    if (!rocketChatUrl) return

    const targetOrigin = new URL(rocketChatUrl).origin

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return

      // Handle RocketChat ready event
      if (event.data?.eventName === 'startup') {
        console.log('[RocketChat] Iframe ready, attempting auto-login')
        handleIframeLogin()
      }

      // Handle successful login
      if (event.data?.eventName === 'login') {
        setIsLoggedIn(true)
        console.log('[RocketChat] Auto-login successful')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
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
    { label: "My Store", channelName: seller?.handle ? `vendor-${seller.handle}` : (seller?.id ? `vendor-${seller.id}` : null) },
    { label: "Support", channelName: "support" },
    { label: "General", channelName: "general" },
  ].filter(link => link.channelName)

  return (
    <Container className="divide-y p-0 min-h-[700px]">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Heading>Messages</Heading>
          {isLoggedIn && (
            <Badge color="green" size="small">
              Connected
            </Badge>
          )}
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
