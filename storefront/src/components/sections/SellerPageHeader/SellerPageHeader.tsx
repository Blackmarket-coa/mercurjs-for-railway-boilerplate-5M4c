import { SellerFooter, SellerHeading } from "@/components/organisms"
import { HttpTypes } from "@medusajs/types"
import DOMPurify from "dompurify"

export const SellerPageHeader = ({
  header = false,
  seller,
  user,
}: {
  header?: boolean
  seller: any
  user: HttpTypes.StoreCustomer | null
}) => {
  // Sanitize seller description to prevent XSS attacks
  const sanitizedDescription = typeof window !== "undefined" && seller.description
    ? DOMPurify.sanitize(seller.description, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
      })
    : seller.description || ""

  return (
    <div className="border rounded-sm p-4">
      <SellerHeading header seller={seller} user={user} />
      <p
        dangerouslySetInnerHTML={{
          __html: sanitizedDescription,
        }}
        className="label-md my-5"
      />
      <SellerFooter seller={seller} />
    </div>
  )
}
