import { SellerTabs } from "@/components/organisms"
import { SellerPageHeader } from "@/components/sections"
import { Breadcrumbs } from "@/components/atoms"
import { retrieveCustomer } from "@/lib/data/customer"
import { getRegion } from "@/lib/data/regions"
import { getSellerByHandle } from "@/lib/data/seller"
import { SellerProps } from "@/types/seller"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const seller = await getSellerByHandle(handle) as SellerProps
  
  if (!seller) {
    return { title: "Seller Not Found" }
  }

  return {
    title: `${seller.name} | Shop from this Producer`,
    description: seller.description || `Shop directly from ${seller.name} on FreeBlackMarket. Support conscious businesses.`,
  }
}

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { handle, locale } = await params
  const { page: pageParam } = await searchParams
  const page = Number(pageParam) || 1

  const seller = (await getSellerByHandle(handle)) as SellerProps

  const user = await retrieveCustomer()

  const currency_code = (await getRegion(locale))?.currency_code || "usd"

  const tab = "products"

  if (!seller) {
    return notFound()
  }

  const breadcrumbsItems = [
    { path: "/", label: "Home" },
    { path: "/producers", label: "Producers" },
    { path: `/sellers/${handle}`, label: seller.name },
  ]

  return (
    <main className="container">
      <div className="hidden md:block mb-4 mt-2">
        <Breadcrumbs items={breadcrumbsItems} />
      </div>
      <SellerPageHeader header seller={seller} user={user} />
      <SellerTabs
        tab={tab}
        seller_id={seller.id}
        seller_handle={seller.handle}
        locale={locale}
        currency_code={currency_code}
        page={page}
      />
    </main>
  )
}
