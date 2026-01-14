import { Footer, Header } from "@/components/organisms"
import { BackToTop } from "@/components/atoms"
import { retrieveCustomer } from "@/lib/data/customer"
import { checkRegion } from "@/lib/helpers/check-region"
import { RocketChatProvider } from "@/providers/RocketChatProvider"
import { redirect } from "next/navigation"

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const ROCKETCHAT_URL = process.env.NEXT_PUBLIC_ROCKETCHAT_URL
  const { locale } = params

  let user = null
  let regionIsValid = false

  // --- Region validation (must never crash) ---
  try {
    regionIsValid = await checkRegion(locale)
  } catch (error) {
    console.error("[RootLayout] Region check failed:", error)
  }

  if (!regionIsValid) {
    redirect("/")
  }

  // --- Customer retrieval (anonymous-safe) ---
  try {
    user = await retrieveCustomer()
  } catch {
    // Expected for logged-out users
    user = null
  }

  // --- Default layout (no RocketChat) ---
  if (!ROCKETCHAT_URL || !user) {
    return (
      <>
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </>
    )
  }

  // --- Authenticated layout with RocketChat ---
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
