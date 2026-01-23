"use client"

import { ProductPageAccordion } from "@/components/molecules"
import DOMPurify from "dompurify"

export const ProductPageDetails = ({ details }: { details: string }) => {
  if (!details) return null

  // Sanitize HTML to prevent XSS attacks from user-generated content
  const sanitizedDetails = typeof window !== "undefined" 
    ? DOMPurify.sanitize(details, { 
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'span', 'div'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      })
    : details

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
