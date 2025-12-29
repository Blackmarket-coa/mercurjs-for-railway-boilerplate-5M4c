import { Container, Heading, Text } from "@medusajs/ui"
import { useRocketChat } from "../../providers/rocketchat-provider"

export const Messages = () => {
  const { isConfigured, iframeUrl, rocketChatUrl } = useRocketChat()

  return (
    <Container className="divide-y p-0 min-h-[700px]">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading>Messages</Heading>
        </div>
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

      <div className="px-6 py-4 h-[655px]">
        {isConfigured && iframeUrl ? (
          <iframe
            src={iframeUrl}
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
