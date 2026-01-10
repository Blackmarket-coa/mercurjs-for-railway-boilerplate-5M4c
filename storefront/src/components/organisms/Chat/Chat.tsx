"use client"

import { Button } from "@/components/atoms"
import { Modal } from "@/components/molecules"
import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { SellerProps } from "@/types/seller"
import { MessageIcon } from "@/icons"

const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL || ""

export const Chat = ({
  user,
  seller,
  buttonClassNames,
  icon,
  product,
  subject,
  order_id,
}: {
  user: HttpTypes.StoreCustomer | null
  seller: SellerProps
  buttonClassNames?: string
  icon?: boolean
  product?: HttpTypes.StoreProduct
  subject?: string
  order_id?: string
}) => {
  const [modal, setModal] = useState(false)

  if (!ROCKETCHAT_URL) {
    return null
  }

  // Build a channel name for the conversation
  const channelName = `product-${product?.id || order_id}-${user?.id}-${seller?.id}`
  const iframeUrl = `${ROCKETCHAT_URL}/channel/${channelName}`

  return (
    <>
      <Button
        variant="tonal"
        onClick={() => setModal(true)}
        className={buttonClassNames}
      >
        {icon ? <MessageIcon size={20} /> : "Write to provider"}
      </Button>
      {modal && (
        <Modal heading="Chat" onClose={() => setModal(false)}>
          <div className="px-4">
            <div className="w-full h-[500px]">
              <iframe
                src={iframeUrl}
                title={`Chat with ${seller?.name || 'Provider'}`}
                className="w-full h-full border-0 rounded-lg"
                allow="camera; microphone; fullscreen; display-capture"
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
