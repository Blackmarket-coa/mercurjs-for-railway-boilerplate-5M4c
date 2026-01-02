"use client"

import { useState } from "react"
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline"

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

interface ContactSellerButtonProps {
  sellerHandle: string
  sellerName?: string
  className?: string
  variant?: "button" | "link" | "icon"
}

export const ContactSellerButton = ({
  sellerHandle,
  sellerName,
  className = "",
  variant = "button",
}: ContactSellerButtonProps) => {
  const [showChat, setShowChat] = useState(false)

  if (!ROCKETCHAT_URL) {
    return null
  }

  const channelUrl = `${ROCKETCHAT_URL}/channel/vendor-${sellerHandle}`

  const handleClick = () => {
    // Option 1: Open in new tab
    window.open(channelUrl, "_blank", "noopener,noreferrer")
    
    // Option 2: Show embedded chat modal (uncomment if preferred)
    // setShowChat(true)
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        title={`Message ${sellerName || "Seller"}`}
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
      </button>
    )
  }

  if (variant === "link") {
    return (
      <button
        onClick={handleClick}
        className={`text-primary hover:underline flex items-center gap-1 ${className}`}
      >
        <ChatBubbleLeftRightIcon className="w-4 h-4" />
        <span>Contact {sellerName || "Seller"}</span>
      </button>
    )
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ${className}`}
      >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <span>Message {sellerName || "Seller"}</span>
      </button>

      {/* Embedded Chat Modal (optional) */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Chat with {sellerName || "Seller"}</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <iframe
              src={channelUrl}
              title={`Chat with ${sellerName || "Seller"}`}
              className="flex-1 border-0"
              allow="camera; microphone; fullscreen; display-capture"
            />
          </div>
        </div>
      )}
    </>
  )
}
