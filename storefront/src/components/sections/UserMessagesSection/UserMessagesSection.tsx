"use client"

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

export const UserMessagesSection = () => {
  if (!ROCKETCHAT_URL) {
    return (
      <div className="max-w-full h-[655px] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Chat is not configured</p>
          <p className="text-sm mt-2">Please set NEXT_PUBLIC_ROCKETCHAT_URL environment variable.</p>
        </div>
      </div>
    )
  }

  const iframeUrl = `${ROCKETCHAT_URL}/home`

  return (
    <div className="max-w-full h-[655px]">
      <iframe
        src={iframeUrl}
        title="Messages"
        className="h-full max-w-[760px] w-full border-0 rounded-lg"
        allow="camera; microphone; fullscreen; display-capture"
      />
    </div>
  )
}
