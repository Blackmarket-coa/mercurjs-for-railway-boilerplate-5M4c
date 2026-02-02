"use client"

import { SellerFooter, SellerHeading } from "@/components/organisms"
import { SellerScheduling } from "../SellerScheduling/SellerScheduling"
import { HttpTypes } from "@medusajs/types"
import DOMPurify from "dompurify"
import { useState, useEffect } from "react"

export const SellerPageHeader = ({
  header = false,
  seller,
  user,
}: {
  header?: boolean
  seller: any
  user: HttpTypes.StoreCustomer | null
}) => {
  // State to store sanitized description
  const [sanitizedDescription, setSanitizedDescription] = useState(seller.description || "")

  // Sanitize on client side only to prevent hydration mismatch
  useEffect(() => {
    if (seller.description) {
      const cleaned = DOMPurify.sanitize(seller.description, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      })
      setSanitizedDescription(cleaned)
    }
  }, [seller.description])

  return (
    <div className="border rounded-sm p-4">
      <SellerHeading header seller={seller} user={user} />
      <p
        dangerouslySetInnerHTML={{
          __html: sanitizedDescription,
        }}
        className="label-md my-5"
      />
      <SellerScheduling seller={seller} />
      <SellerFooter seller={seller} />
    </div>
  )
}
