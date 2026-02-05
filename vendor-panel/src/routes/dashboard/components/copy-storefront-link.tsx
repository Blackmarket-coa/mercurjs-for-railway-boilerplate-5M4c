import { CheckCircleSolid, Link as LinkIcon } from "@medusajs/icons"
import { Button, Text, Tooltip } from "@medusajs/ui"
import copy from "copy-to-clipboard"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { MEDUSA_STOREFRONT_URL } from "../../../lib/storefront"
import { useMe } from "../../../hooks/api"
import { useVendorType, VendorType } from "../../../providers/vendor-type-provider/vendor-type-context"

/**
 * Get the storefront URL path based on vendor type
 */
function getStorefrontPath(vendorType: VendorType, handle: string): string {
  switch (vendorType) {
    case "producer":
      return `/producers/${handle}`
    case "garden":
      return `/gardens/${handle}`
    case "kitchen":
      return `/kitchens/${handle}`
    case "maker":
    case "restaurant":
    case "mutual_aid":
    case "default":
    default:
      return `/sellers/${handle}`
  }
}

/**
 * Component to copy the vendor's storefront link to clipboard
 */
export const CopyStorefrontLink = () => {
  const [done, setDone] = useState(false)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("Copy link")
  const { t } = useTranslation()

  const { seller } = useMe()
  const { vendorType } = useVendorType()

  const handle = seller?.handle
  const storefrontUrl = handle
    ? `${MEDUSA_STOREFRONT_URL}${getStorefrontPath(vendorType, handle)}`
    : null

  const copyToClipboard = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation()

    if (!storefrontUrl) return

    setDone(true)
    copy(storefrontUrl)

    setTimeout(() => {
      setDone(false)
    }, 2000)
  }

  useEffect(() => {
    if (done) {
      setText(t("actions.copied"))
      return
    }

    setTimeout(() => {
      setText(t("actions.copy"))
    }, 500)
  }, [done, t])

  if (!handle) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-ui-bg-subtle rounded-lg border border-ui-border-base">
      <div className="flex items-center gap-2">
        <LinkIcon className="w-5 h-5 text-ui-fg-muted" />
        <Text className="font-medium text-ui-fg-base">Share Your Store</Text>
      </div>
      <Text className="text-ui-fg-subtle text-sm">
        Share this link on social media to let customers find your store
      </Text>
      <div className="flex items-center gap-2 mt-1">
        <div className="flex-1 bg-ui-bg-base px-3 py-2 rounded border border-ui-border-base overflow-hidden">
          <Text className="text-ui-fg-subtle text-sm truncate block">
            {storefrontUrl}
          </Text>
        </div>
        <Tooltip content={text} open={done || open} onOpenChange={setOpen}>
          <Button
            variant="secondary"
            size="small"
            aria-label="Copy storefront link"
            onClick={copyToClipboard}
          >
            {done ? (
              <CheckCircleSolid className="text-ui-tag-green-icon" />
            ) : (
              <LinkIcon />
            )}
            {done ? "Copied!" : "Copy"}
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}
