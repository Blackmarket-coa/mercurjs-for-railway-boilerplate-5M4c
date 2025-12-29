import { ProducersPage } from "@/components/sections/ProducersPage/ProducersPage"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Producers | Local Farms & Food Artisans",
  description: "Meet the farmers and food artisans behind your food. Learn about their growing practices, certifications, and stories.",
}

export default async function Producers({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <main className="container py-8">
      <ProducersPage locale={locale} />
    </main>
  )
}
