"use client"

type ChatProps = {
  order_id?: string
  product_id?: string
  subject?: string | null
  currentUser: {
    id: string
    name: string
    email: string | null
    photoUrl?: string
    role: string
  }
  supportUser: {
    id: string
    name: string
    email: string | null
    photoUrl?: string
    role: string
  }
}

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

export function ChatBox({
  currentUser,
  supportUser,
  subject,
  order_id,
  product_id,
}: ChatProps) {
  if (!ROCKETCHAT_URL) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center text-gray-500">
        Chat is not configured. Please set NEXT_PUBLIC_ROCKETCHAT_URL.
      </div>
    )
  }

  // Build a channel name for the conversation
  const channelName = `product-${product_id || order_id}-${currentUser.id}-${supportUser.id}`
  const iframeUrl = `${ROCKETCHAT_URL}/channel/${channelName}`

  return (
    <div className="w-full h-[500px]">
      <iframe
        src={iframeUrl}
        title={`Chat with ${supportUser.name || 'Support'}`}
        className="w-full h-full border-0 rounded-lg"
        allow="camera; microphone; fullscreen; display-capture"
      />
    </div>
  )
}
