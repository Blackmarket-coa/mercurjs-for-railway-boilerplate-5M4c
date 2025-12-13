import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Toaster } from "@medusajs/ui"
import Head from "next/head"
import { retrieveCart } from "@/lib/data/cart"
import { Providers } from "./providers"

/* ------------------------------
   Local font (Railway-safe)
-------------------------------- */
const funnelDisplay = localFont({
  src: [
    {
      path: "../fonts/FunnelDisplay/FunnelDisplay-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/FunnelDisplay/FunnelDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/FunnelDisplay/FunnelDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/FunnelDisplay/FunnelDisplay-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-funnel-sans",
  display: "swap",
})

/* ------------------------------
   Metadata
-------------------------------- */
export const metadata: Metadata = {
  title: {
    template: `%s | ${
      process.env.NEXT_PUBLIC_SITE_NAME || "Black Market Coalition"
    }`,
    default:
      process.env.NEXT_PUBLIC_SITE_NAME || "Black Market Coalition",
  },
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Black Market Coalition",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  alternates: {
    languages: {
      "x-default":
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    },
  },
}

/* ------------------------------
   Root layout
-------------------------------- */
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params
  const cart = await retrieveCart()

  const ALGOLIA_APP = process.env.NEXT_PUBLIC_ALGOLIA_ID
  const htmlLang = locale || "en"

  return (
    <html lang={htmlLang} className={funnelDisplay.variable}>
      <Head>
        {/* Image & API origins */}
        <link
          rel="preconnect"
          href="https://i.imgur.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://i.imgur.com" />

        {ALGOLIA_APP && (
          <>
            <link
              rel="preconnect"
              href="https://algolia.net"
              crossOrigin="anonymous"
            />
            <link
              rel="preconnect"
              href="https://algolianet.com"
              crossOrigin="anonymous"
            />
            <link rel="dns-prefetch" href="https://algolia.net" />
            <link rel="dns-prefetch" href="https://algolianet.com" />
          </>
        )}

        <link
          rel="preconnect"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://medusa-public-images.s3.eu-west-1.amazonaws.com"
        />

        <link
          rel="preconnect"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://mercur-connect.s3.eu-central-1.amazonaws.com"
        />

        <link
          rel="preconnect"
          href="https://s3.eu-central-1.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://s3.eu-central-1.amazonaws.com" />

        <link
          rel="preconnect"
          href="https://api.mercurjs.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://api.mercurjs.com" />
      </Head>

      <body className="antialiased bg-primary text-secondary relative">
