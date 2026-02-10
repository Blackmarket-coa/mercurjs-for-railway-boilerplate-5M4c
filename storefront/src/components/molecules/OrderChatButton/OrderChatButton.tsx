"use client"

import { MessageCircle } from "lucide-react"

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

interface OrderChatButtonProps {
  orderId: string
  sellerHandle?: string
  className?: string
}

export const OrderChatButton = ({
  orderId,
  sellerHandle,
  className = "",
}: OrderChatButtonProps) => {
  if (!ROCKETCHAT_URL) {
    return null
  }

  // Clean order ID for channel name
  const cleanOrderId = orderId.replace('order_', '')
  
  // Order channels could be either order-specific or go to vendor channel
  const channelUrl = sellerHandle
    ? `${ROCKETCHAT_URL}/channel/vendor-${sellerHandle}`
    : `${ROCKETCHAT_URL}/channel/order-${cleanOrderId}`

  const handleClick = () => {
    window.open(channelUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${className}`}
    >
      <MessageCircle className="w-4 h-4" />
      <span>Chat about this order</span>
    </button>
  )
}
