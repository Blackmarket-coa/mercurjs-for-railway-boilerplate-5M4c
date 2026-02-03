import { ArrowRightIcon } from "@/icons"
import Link from "next/link"

const VENDOR_URL = process.env.NEXT_PUBLIC_VENDOR_URL || "https://vendor.mercurjs.com"

export const SellNowButton = () => {
  return (
    <Link
      href={VENDOR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold text-xs lg:text-sm uppercase px-3 py-2 lg:px-4 lg:py-2 rounded-md transition-colors duration-200"
    >
      <span className="hidden sm:inline">Sell With Us</span>
      <span className="sm:hidden">Sell</span>
      <ArrowRightIcon
        color="white"
        className="w-4 h-4 lg:w-5 lg:h-5 group-hover:translate-x-0.5 transition-transform duration-200"
      />
    </Link>
  )
}
