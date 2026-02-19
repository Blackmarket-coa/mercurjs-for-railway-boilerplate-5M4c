import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { GardenDetailPage } from "@/components/sections/GardensPage/GardenDetailPage"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  
  return {
    title: `Garden | BMC Marketplace`,
    description: `View details about this community garden, support their mission, and explore what they're growing.`,
  }
}

export default async function GardenPage({
  params,
}: {
  params: Promise<{ locale: string; handle: string }>
}) {
  const { locale, handle } = await params

  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  const response = await fetch(`${backendUrl}/store/gardens/${handle}`, {
    headers: {
      "Content-Type": "application/json",
      "x-publishable-api-key": publishableKey,
    },
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    return notFound()
  }

  return <GardenDetailPage handle={handle} locale={locale} />
}
