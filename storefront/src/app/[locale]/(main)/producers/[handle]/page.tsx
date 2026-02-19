import { ProducerDetailPage } from "@/components/sections/ProducerDetailPage/ProducerDetailPage"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  
  // Fetch producer data for metadata
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  
  try {
    const response = await fetch(`${backendUrl}/store/producers/${handle}`, {
      next: { revalidate: 60 },
    })
    
    if (response.ok) {
      const { producer } = await response.json()
      return {
        title: `${producer.name} | Local Producer`,
        description: producer.description || producer.story || `Learn about ${producer.name} and their farming practices.`,
        openGraph: {
          images: producer.photo ? [producer.photo] : [],
        },
      }
    }
  } catch (error) {
    // Fallback metadata
  }

  return {
    title: "Producer Profile",
    description: "Learn about our local producers and their farming practices.",
  }
}

export default async function ProducerPage({
  params,
}: {
  params: Promise<{ handle: string; locale: string }>
}) {
  const { handle, locale } = await params
  const backendUrl = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  const response = await fetch(`${backendUrl}/store/producers/${handle}`, {
    next: { revalidate: 60 },
  })

  if (!response.ok) {
    return notFound()
  }

  return (
    <main className="container py-8">
      <ProducerDetailPage handle={handle} locale={locale} />
    </main>
  )
}
