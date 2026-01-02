"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React, { MouseEventHandler } from "react"

/**
 * Helper function to check if a URL is external
 */
const isExternalUrl = (href: string): boolean => {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")
}

/**
 * Use this component to create a Next.js `<LocalizedClientLink />` that persists the current country code in the url,
 * without having to explicitly pass it as a prop.
 * 
 * External URLs (starting with http://, https://, or //) are handled as regular anchor tags
 * and open in a new tab.
 */
const LocalizedClientLink = ({
  children,
  href,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement> | undefined
  passHref?: true
  [x: string]: any
}) => {
  const { locale } = useParams()

  // Handle external URLs - don't prepend locale, open in new tab
  if (isExternalUrl(href)) {
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer" 
        {...props}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={`/${locale}${href}`} {...props}>
      {children}
    </Link>
  )
}

export default LocalizedClientLink
