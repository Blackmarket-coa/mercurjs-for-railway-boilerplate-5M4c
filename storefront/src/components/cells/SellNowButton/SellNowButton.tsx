import { Button } from "@/components/atoms"
import { ArrowRightIcon } from "@/icons"
import Link from "next/link"

const VENDOR_URL = process.env.NEXT_PUBLIC_VENDOR_URL || "https://vendor.mercurjs.com"

export const SellNowButton = () => {
  return (
    <Link
      href={VENDOR_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Button className="group uppercase !font-bold pl-12 gap-1 flex items-center">
        Join Us
        <ArrowRightIcon
          color="white"
          className="w-5 h-5 group-hover:opacity-100 opacity-0 transition-all duration-300"
        />
      </Button>
    </Link>
  )
}
