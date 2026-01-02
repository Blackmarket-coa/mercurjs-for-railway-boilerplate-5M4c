import type { Metadata } from "next"
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

  return <GardenDetailPage handle={handle} locale={locale} />
}
