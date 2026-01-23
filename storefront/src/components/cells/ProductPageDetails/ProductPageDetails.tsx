"use client"

import { ProductPageAccordion } from "@/components/molecules"
import DOMPurify from "dompurify"
import { useState, useEffect } from "react"

export const ProductPageDetails = ({ details }: { details: string }) => {
  // State to store sanitized details
  const [sanitizedDetails, setSanitizedDetails] = useState(details)

  // Sanitize on client side only to prevent hydration mismatch
  useEffect(() => {
    if (details) {
      const cleaned = DOMPurify.sanitize(details, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      })
      setSanitizedDetails(cleaned)
    }
  }, [details])

  if (!details) return null

  return (
    <ProductPageAccordion heading="Product details" defaultOpen={false}>
      <div
        className="product-details"
        dangerouslySetInnerHTML={{
          __html: sanitizedDetails,
        }}
      />
    </ProductPageAccordion>
  )
}
