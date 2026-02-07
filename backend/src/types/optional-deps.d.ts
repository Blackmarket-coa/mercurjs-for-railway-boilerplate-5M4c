/**
 * Type declarations for optional dependencies
 * These modules are dynamically imported and may not be installed
 */

// @sentry/node is optional - used for error tracking
declare module "@sentry/node" {
  export function init(options: Record<string, unknown>): void
  export function withScope<T>(callback: (scope: Scope) => T): T
  export function captureException(error: unknown): string
  export function captureMessage(message: string, level?: string): string
  export function setUser(user: Record<string, unknown> | null): void
  export function addBreadcrumb(breadcrumb: Record<string, unknown>): void
  export function startInactiveSpan(options: Record<string, unknown>): { finish: () => void }
  export function flush(timeout: number): Promise<boolean>

  export interface Scope {
    setTag(key: string, value: string): void
    setExtra(key: string, value: unknown): void
    setUser(user: Record<string, unknown>): void
    setLevel(level: string): void
  }
}

declare module "jsonwebtoken" {
  export class TokenExpiredError extends Error {}
  export class JsonWebTokenError extends Error {}

  export function decode(token: string): Record<string, unknown> | null
  export function verify(token: string, secretOrPublicKey: string): Record<string, unknown> | string

  const jwt: {
    decode: typeof decode
    verify: typeof verify
    TokenExpiredError: typeof TokenExpiredError
    JsonWebTokenError: typeof JsonWebTokenError
  }

  export default jwt
}

