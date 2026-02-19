import type { Metadata } from "next"
import SellPageClient from "./SellPageClient"

export const metadata: Metadata = {
  title: "Sell on Free Black Market",
  description:
    "Learn how to open your shop, list products, and grow your business on Free Black Market.",
}

export default function SellPage() {
  return <SellPageClient />
}
