import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { KitchenDetailPage } from "@/components/sections/KitchensPage/KitchenDetailPage"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params

  return {
    title: `Kitchen | BMC Marketplace`,
    description: `View details about this community kitchen, explore available stations, and book kitchen time.`,
  }
}

export default async function KitchenPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>
}) {
  const { locale, handle } = await params

  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  const response = await fetch(`${backendUrl}/store/kitchens`, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
    },
    next: { revalidate: 60 },
  })

  const data = response.ok ? await response.json() : { kitchens: [] }
  const kitchen = (data.kitchens || []).find(
    (item: { handle?: string; slug?: string }) => item.handle === handle || item.slug === handle
  )

  if (!kitchen) {
    return notFound()
  }

  return <KitchenDetailPage handle={handle} locale={locale} />
}
