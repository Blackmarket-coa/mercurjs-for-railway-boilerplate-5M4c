// src/app/layout.tsx
import "./globals.css"
import { Funnel_Display } from "next/font/google"
import Head from "next/head"

// Google Font setup
const funnelDisplay = Funnel_Display({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-funnel-sans",
  display: "swap",
})

export const metadata = {
  title: "Black Market Coalition Storefront",
  description: "Secure and reliable B2C marketplace",
}

export default function RootLayout({
  children,
  locale,
}: {
  children: React.ReactNode
  locale?: string
}) {
  const htmlLang = locale || "en"

  return (
    <html lang={htmlLang} className={funnelDisplay.variable}>
      <Head>
        {/* Image & API origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </Head>
      <body className="antialiased bg-primary text-secondary relative">
        {children}
      </body>
    </html>
  )
}
