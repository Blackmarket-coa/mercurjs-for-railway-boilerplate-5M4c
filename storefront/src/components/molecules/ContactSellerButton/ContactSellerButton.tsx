"use client"

import { useState } from "react"

// Inline SVG icon to avoid heroicons dependency
const ChatBubbleLeftRightIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" 
    />
  </svg>
)

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
