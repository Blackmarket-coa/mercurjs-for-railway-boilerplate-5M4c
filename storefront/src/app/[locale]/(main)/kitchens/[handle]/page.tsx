import type { Metadata } from "next"
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

  return <KitchenDetailPage handle={handle} locale={locale} />
}
