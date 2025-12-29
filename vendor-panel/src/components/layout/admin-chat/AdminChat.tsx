import { ChatBubble } from "@medusajs/icons"
import { Drawer, Heading, IconButton, Text } from "@medusajs/ui"
import { useState } from "react"
import { useMe } from "../../../hooks/api"
import { useRocketChat } from "../../../providers/rocketchat-provider"

export const AdminChat = () => {
  const [open, setOpen] = useState(false)

  const { seller, isPending } = useMe()
  const { isConfigured, rocketChatUrl } = useRocketChat()

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
              src={adminChatUrl}
              title="Admin Chat"
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="camera; microphone; fullscreen; display-capture"
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
