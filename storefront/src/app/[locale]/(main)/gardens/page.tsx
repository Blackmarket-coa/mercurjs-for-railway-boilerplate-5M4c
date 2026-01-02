import type { Metadata } from "next"
import { GardensLandingPage } from "@/components/sections/GardensPage/GardensLandingPage"

export const metadata: Metadata = {
  title: "Community Gardens | BMC Marketplace",
  description: "Discover and support community gardens in your area. Browse local gardens, contribute to seasonal funding, or volunteer your time.",
}

export default async function GardensPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return <GardensLandingPage locale={locale} />
}
