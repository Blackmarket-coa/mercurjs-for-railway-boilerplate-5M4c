/**
 * Security Headers Middleware for FreeBlackMarket.com Backend
 * 
 * Adds essential security headers for production environments:
 * - Strict-Transport-Security (HSTS)
 * - Content-Security-Policy (CSP)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - X-XSS-Protection
 * - Referrer-Policy
 * - Permissions-Policy
 * 
 * Usage in Medusa API route:
 * ```typescript
 * import { securityHeaders } from "../shared/security-headers"
 * 
 * export const config = {
 *   routes: [{ 
 *     matcher: "/store/*", 
 *     middlewares: [securityHeaders()] 
 *   }]
 * }
 * ```
 */
import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"

interface SecurityHeadersOptions {
  /** Enable HSTS (default: true in production) */
  hsts?: boolean
  /** HSTS max-age in seconds (default: 1 year) */
  hstsMaxAge?: number
  /** Include subdomains in HSTS (default: true) */
  hstsIncludeSubdomains?: boolean
  /** Enable HSTS preload (default: false - requires manual submission) */
  hstsPreload?: boolean
  /** Content Security Policy directives */
  csp?: ContentSecurityPolicy
  /** Disable all headers (for testing) */
  disabled?: boolean
}

interface ContentSecurityPolicy {
  defaultSrc?: string[]
  scriptSrc?: string[]
  styleSrc?: string[]
  imgSrc?: string[]
  fontSrc?: string[]
  connectSrc?: string[]
  frameSrc?: string[]
  objectSrc?: string[]
  upgradeInsecureRequests?: boolean
}

const DEFAULT_CSP: ContentSecurityPolicy = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], // Needed for some Medusa admin features
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:", "blob:"],
  fontSrc: ["'self'", "https:", "data:"],
  connectSrc: [
    "'self'",
    "https://api.stripe.com",
    "https://*.algolia.net",
    "https://*.algolianet.com",
    "wss:", // WebSocket connections
  ],
  frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
  objectSrc: ["'none'"],
  upgradeInsecureRequests: true,
}

/**
 * Build CSP header string from policy object
 */
function buildCspHeader(policy: ContentSecurityPolicy): string {
  const directives: string[] = []

  if (policy.defaultSrc?.length) {
    directives.push(`default-src ${policy.defaultSrc.join(" ")}`)
  }
  if (policy.scriptSrc?.length) {
    directives.push(`script-src ${policy.scriptSrc.join(" ")}`)
  }
  if (policy.styleSrc?.length) {
    directives.push(`style-src ${policy.styleSrc.join(" ")}`)
  }
  if (policy.imgSrc?.length) {
    directives.push(`img-src ${policy.imgSrc.join(" ")}`)
  }
  if (policy.fontSrc?.length) {
    directives.push(`font-src ${policy.fontSrc.join(" ")}`)
  }
  if (policy.connectSrc?.length) {
    directives.push(`connect-src ${policy.connectSrc.join(" ")}`)
  }
  if (policy.frameSrc?.length) {
    directives.push(`frame-src ${policy.frameSrc.join(" ")}`)
  }
  if (policy.objectSrc?.length) {
    directives.push(`object-src ${policy.objectSrc.join(" ")}`)
  }
  if (policy.upgradeInsecureRequests) {
    directives.push("upgrade-insecure-requests")
  }

  return directives.join("; ")
}

/**
 * Create security headers middleware
 */
export function securityHeaders(options: SecurityHeadersOptions = {}) {
  const isProduction = process.env.NODE_ENV === "production"

  return (
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) => {
    if (options.disabled) {
      return next()
    }

    // Strict-Transport-Security (HSTS)
    // Only enable in production over HTTPS
    const enableHsts = options.hsts ?? isProduction
    if (enableHsts) {
      const maxAge = options.hstsMaxAge ?? 31536000 // 1 year
      let hstsValue = `max-age=${maxAge}`
      if (options.hstsIncludeSubdomains ?? true) {
        hstsValue += "; includeSubDomains"
      }
      if (options.hstsPreload) {
        hstsValue += "; preload"
      }
      res.setHeader("Strict-Transport-Security", hstsValue)
    }

    // Content-Security-Policy
    const cspPolicy = { ...DEFAULT_CSP, ...options.csp }
    res.setHeader("Content-Security-Policy", buildCspHeader(cspPolicy))

    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "SAMEORIGIN")

    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff")

    // XSS Protection (legacy, but still useful for older browsers)
    res.setHeader("X-XSS-Protection", "1; mode=block")

    // Control referrer information
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin")

    // Disable potentially dangerous browser features
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(self)"
    )

    // Prevent DNS prefetching
    res.setHeader("X-DNS-Prefetch-Control", "off")

    // Disable client-side caching for API responses (security)
    if (req.path?.startsWith("/admin") || req.path?.startsWith("/vendor")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
      res.setHeader("Pragma", "no-cache")
      res.setHeader("Expires", "0")
    }

    next()
  }
}

/**
 * Relaxed CSP for development (allows hot reload, etc.)
 */
export function developmentSecurityHeaders() {
  return securityHeaders({
    hsts: false,
    csp: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      fontSrc: ["'self'", "https:", "http:", "data:"],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
      frameSrc: ["'self'", "https:", "http:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: false,
    },
  })
}

/**
 * Export default middleware based on environment
 */
export const defaultSecurityHeaders =
  process.env.NODE_ENV === "production"
    ? securityHeaders()
    : developmentSecurityHeaders()
