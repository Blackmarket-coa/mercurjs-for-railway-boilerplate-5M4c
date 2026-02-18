import { createHash } from "crypto"
import { cache } from "./cache"

type IdempotencyRecord = {
  key: string
  fingerprint: string
  seen_at: string
}

const inMemoryFallback = new Map<string, IdempotencyRecord>()

function toFingerprint(payload: unknown): string {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex")
}

function buildStorageKey(scope: string, idempotencyKey: string): string {
  return `idempotency:${scope}:${idempotencyKey}`
}

export async function checkAndStoreIdempotency(params: {
  scope: string
  idempotencyKey?: string
  payload: unknown
  ttlSeconds?: number
}) {
  const { scope, idempotencyKey, payload, ttlSeconds = 24 * 60 * 60 } = params

  if (!idempotencyKey) {
    return { duplicate: false as const }
  }

  const key = buildStorageKey(scope, idempotencyKey)
  const fingerprint = toFingerprint(payload)

  const existing = await cache.get<IdempotencyRecord>(key)
  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      return {
        duplicate: true as const,
        conflict: true as const,
        message: "idempotency_key already used with a different payload fingerprint",
      }
    }

    return { duplicate: true as const, conflict: false as const }
  }

  const record: IdempotencyRecord = {
    key,
    fingerprint,
    seen_at: new Date().toISOString(),
  }

  const cached = await cache.set(key, record, ttlSeconds)
  if (!cached) {
    const fallback = inMemoryFallback.get(key)
    if (fallback) {
      if (fallback.fingerprint !== fingerprint) {
        return {
          duplicate: true as const,
          conflict: true as const,
          message: "idempotency_key already used with a different payload fingerprint",
        }
      }

      return { duplicate: true as const, conflict: false as const }
    }

    inMemoryFallback.set(key, record)
  }

  return { duplicate: false as const }
}
