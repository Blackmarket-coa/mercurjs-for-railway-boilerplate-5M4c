import type { Metadata } from "next"
import { KitchensLandingPage } from "@/components/sections/KitchensPage/KitchensLandingPage"

export const metadata: Metadata = {
  title: "Community Kitchens | BMC Marketplace",
  description: "Discover shared-use commercial kitchens in your community. Find space to grow your food business, book kitchen time, or support local food entrepreneurs.",
}

export default async function KitchensPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return <KitchensLandingPage locale={locale} />
}
