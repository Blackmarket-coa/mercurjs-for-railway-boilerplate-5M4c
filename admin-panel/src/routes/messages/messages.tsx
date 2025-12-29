import { Container, Heading, Text } from "@medusajs/ui";
import { ChatBubbleLeftRight } from "@medusajs/icons";

import { useRocketChat } from "@hooks/api/messages";

export const Messages = () => {
  const { isConfigured, rocketChatUrl, isLoading } = useRocketChat();

  // Build iframe URL for admin messages
  const iframeUrl = rocketChatUrl ? `${rocketChatUrl}/home` : "";

  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <Heading>Messages</Heading>
        {isConfigured && rocketChatUrl && (
          <a
            href={rocketChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ui-fg-interactive hover:underline text-sm"
          >
            Open in new tab
          </a>
        )}
      </div>
      <div className="h-[600px] py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            Loading...
          </div>
        ) : isConfigured && rocketChatUrl ? (
          <iframe
            src={iframeUrl}
            title="Rocket.Chat Messages"
            className="w-full h-full border-0 rounded-lg"
            allow="camera; microphone; fullscreen; display-capture"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center">
            <ChatBubbleLeftRight className="w-12 h-12 text-ui-fg-muted mb-4" />
            <Heading>Chat Not Configured</Heading>
            <Text className="mt-4 text-ui-fg-muted text-center max-w-md">
              Please set the ROCKETCHAT_URL environment variable in your backend
              to enable chat functionality.
            </Text>
          </div>
        )}
      </div>
    </Container>
  );
};
