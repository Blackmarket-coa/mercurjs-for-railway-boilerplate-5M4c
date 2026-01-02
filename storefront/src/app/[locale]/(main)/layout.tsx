import { Footer, Header } from "@/components/organisms"
import { BackToTop } from "@/components/atoms"
import { retrieveCustomer } from "@/lib/data/customer"
import { checkRegion } from "@/lib/helpers/check-region"
import { RocketChatProvider } from "@/providers/RocketChatProvider"
import { redirect } from "next/navigation"

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL
  const { locale } = await params

  const user = await retrieveCustomer()
  const regionCheck = await checkRegion(locale)

  if (!regionCheck) {
    return redirect("/")
  }

  if (!ROCKETCHAT_URL || !user)
    return (
      <>
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </>
    )

  return (
    <>
      <RocketChatProvider>
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </RocketChatProvider>
    </>
  )
}
