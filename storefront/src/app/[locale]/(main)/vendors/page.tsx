import { VendorsPage } from "@/components/sections/VendorsPage/VendorsPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shop by Vendor | Browse All Vendors",
  description:
    "Discover producers, community gardens, kitchens, makers, restaurants, and mutual aid organizations. Filter by type or find vendors near you.",
}

export default async function Vendors({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="container py-8">
      <VendorsPage locale={locale} />
    </main>
  )
}
