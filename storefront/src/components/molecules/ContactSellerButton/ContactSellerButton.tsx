"use client"

import { useState } from "react"

// Filled chat icon for better visibility
const ChatBubbleFilledIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path 
      fillRule="evenodd" 
      d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97z" 
      clipRule="evenodd" 
    />
  </svg>
)

// Outline chat icon for secondary usage
const ChatBubbleOutlineIcon = ({ className = "" }: { className?: string }) => (
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
      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" 
    />
  </svg>
)

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

interface ContactSellerButtonProps {
  sellerHandle: string
  sellerName?: string
  className?: string
  variant?: "button" | "link" | "icon" | "prominent"
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
    // Open in new tab
    window.open(channelUrl, "_blank", "noopener,noreferrer")
  }

  // Prominent variant - for product pages, stands out more
  if (variant === "prominent") {
    return (
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg group ${className}`}
        aria-label={`Message ${sellerName || "Seller"}`}
      >
        <ChatBubbleFilledIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="font-medium">Message {sellerName || "Seller"}</span>
      </button>
    )
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={`p-2.5 rounded-full bg-green-50 hover:bg-green-100 text-green-700 transition-colors ${className}`}
        title={`Message ${sellerName || "Seller"}`}
        aria-label={`Message ${sellerName || "Seller"}`}
      >
        <ChatBubbleFilledIcon className="w-5 h-5" />
      </button>
    )
  }

  if (variant === "link") {
    return (
      <button
        onClick={handleClick}
        className={`text-green-700 hover:text-green-800 hover:underline flex items-center gap-1.5 font-medium ${className}`}
        aria-label={`Contact ${sellerName || "Seller"}`}
      >
        <ChatBubbleOutlineIcon className="w-4 h-4" />
        <span>Contact {sellerName || "Seller"}</span>
      </button>
    )
  }

  // Default button variant
  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm hover:shadow ${className}`}
        aria-label={`Message ${sellerName || "Seller"}`}
      >
        <ChatBubbleFilledIcon className="w-5 h-5" />
        <span className="font-medium">Message {sellerName || "Seller"}</span>
      </button>

      {/* Embedded Chat Modal (optional) */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold">Chat with {sellerName || "Seller"}</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close chat"
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
