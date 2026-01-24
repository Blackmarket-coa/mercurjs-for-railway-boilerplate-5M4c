import { Container, Heading, Text, Badge } from "@medusajs/ui"
import { useRocketChat } from "../../providers/rocketchat-provider"

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

  // Build iframe URL with auto-login token
  const getIframeUrl = () => {
    if (!iframeUrl) return null

    // If we have a login token, add it to the URL for auto-login
    if (loginToken) {
      const url = new URL(iframeUrl)
      url.searchParams.set('resumeToken', loginToken)
      return url.toString()
    }

    return iframeUrl
  }

  const finalIframeUrl = getIframeUrl()

  // Quick links to common channels
  const quickLinks = [
    { label: "My Store", url: seller?.handle ? getChannelUrl(`vendor-${seller.handle}`) : null },
    { label: "Support", url: getChannelUrl("support") },
    { label: "General", url: getChannelUrl("general") },
  ].filter(link => link.url)

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
                    const iframe = document.querySelector('iframe[title="Rocket.Chat Messages"]') as HTMLIFrameElement
                    if (iframe && link.url) {
                      iframe.src = link.url
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
        {isConfigured && finalIframeUrl ? (
          <iframe
            src={finalIframeUrl}
            className="w-full h-full border-0 rounded-lg"
            title="Rocket.Chat Messages"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
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
