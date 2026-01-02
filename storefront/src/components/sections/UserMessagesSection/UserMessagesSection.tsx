"use client"

import { useState } from "react"

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

interface UserMessagesSectionProps {
  // Optional: specific channel to open (e.g., for vendor or order messaging)
  channelName?: string
  // Optional: direct message to a specific user
  directMessageUser?: string
}

export const UserMessagesSection = ({ 
  channelName, 
  directMessageUser 
}: UserMessagesSectionProps = {}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  if (!ROCKETCHAT_URL) {
    return (
      <div className="max-w-full h-[655px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Chat is not configured</p>
          <p className="text-sm mt-2">Please contact support for assistance.</p>
        </div>
      </div>
    )
  }

  // Build the appropriate URL based on props
  let iframeUrl = ROCKETCHAT_URL
  if (directMessageUser) {
    iframeUrl = `${ROCKETCHAT_URL}/direct/${directMessageUser}`
  } else if (channelName) {
    iframeUrl = `${ROCKETCHAT_URL}/channel/${channelName}`
  } else {
    iframeUrl = `${ROCKETCHAT_URL}/home`
  }

  return (
    <div className={`max-w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'h-[655px]'}`}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Messages</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-sm text-primary hover:underline"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
          <a
            href={ROCKETCHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Open in new tab
          </a>
        </div>
      </div>
      <iframe
        src={iframeUrl}
        title="Messages"
        className={`w-full border-0 rounded-lg ${isFullscreen ? 'h-[calc(100vh-60px)]' : 'h-[600px]'}`}
        allow="camera; microphone; fullscreen; display-capture"
      />
    </div>
  )
}

// Helper function to get vendor channel URL
export const getVendorChannelUrl = (vendorHandle: string) => {
  if (!ROCKETCHAT_URL) return null
  return `${ROCKETCHAT_URL}/channel/vendor-${vendorHandle}`
}

// Helper function to get order channel URL
export const getOrderChannelUrl = (orderId: string) => {
  if (!ROCKETCHAT_URL) return null
  const cleanOrderId = orderId.replace('order_', '')
  return `${ROCKETCHAT_URL}/channel/order-${cleanOrderId}`
}
