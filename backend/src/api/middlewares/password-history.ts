import type {
  MedusaRequest,
  MedusaResponse,
  MedusaNextFunction,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { PASSWORD_HISTORY_MODULE } from "../../modules/password-history"
import type PasswordHistoryService from "../../modules/password-history/service"

/**
 * Configuration for password history checking
 */
const PASSWORD_HISTORY_CONFIG = {
  // Number of previous passwords to check against (0 = unlimited)
  maxHistoryCount: 5,
  // Enable/disable password history checking
  enabled: true,
}

/**
 * Decode a password reset token to extract auth identity info
 * MedusaJS password reset tokens contain: entity_id (email), provider, exp, iat
 */
function decodeResetToken(token: string): { entityId: string; provider: string } | null {
  try {
    // Password reset tokens are JWTs - decode without verification to get payload
    // (the actual verification is done by MedusaJS)
    const payload = jwt.decode(token) as Record<string, unknown> | null
    if (!payload) return null

    const entityId =
      (payload.entity_id as string) ||
      (payload.email as string) ||
      null

    const provider = (payload.provider as string) || "emailpass"

    if (!entityId) return null

    return { entityId, provider }
  } catch (error) {
    console.error("[password-history] Failed to decode reset token:", error)
    return null
  }
}

/**
 * Middleware to prevent password reuse
 *
 * This middleware intercepts password update requests and:
 * 1. Extracts the auth identity ID from the reset token
 * 2. Retrieves the current password hash from provider_identity
 * 3. Checks if the new password matches any previous passwords
 * 4. If a match is found, rejects the request
 * 5. After successful update, stores the old password hash in history
 */
export async function preventPasswordReuseMiddleware(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // Skip if password history is disabled
  if (!PASSWORD_HISTORY_CONFIG.enabled) {
    return next()
  }

  // Only process requests with password in the body
  const body = req.body as Record<string, unknown> | undefined
  if (!body?.password || typeof body.password !== "string") {
    return next()
  }

  const newPassword = body.password

  // Get the reset token from the Authorization header or query parameter
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : (req.query.token as string)

  if (!token) {
    return next()
  }

  // Decode the reset token to get auth identity info
  const tokenInfo = decodeResetToken(token)
  if (!tokenInfo) {
    console.warn("[password-history] Could not decode reset token - skipping history check")
    return next()
  }

  const { entityId, provider } = tokenInfo

  try {
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)

    // Look up the auth_identity_id using the email (entity_id) from the token
    // The provider_identity table stores the email in entity_id field
    const providerResult = await pgConnection.raw(`
      SELECT pi.auth_identity_id, pi.provider_metadata
      FROM provider_identity pi
      WHERE pi.entity_id = ?
        AND pi.provider = ?
      LIMIT 1
    `, [entityId, provider])

    const providerData = providerResult.rows?.[0]
    if (!providerData?.auth_identity_id) {
      console.warn(`[password-history] Could not find auth identity for email: ${entityId}`)
      return next()
    }

    const authIdentityId = providerData.auth_identity_id

    // Parse provider_metadata - it may come as a JSON string from raw SQL query
    let providerMetadata = providerData.provider_metadata
    if (typeof providerMetadata === "string") {
      try {
        providerMetadata = JSON.parse(providerMetadata)
      } catch {
        console.warn("[password-history] Could not parse provider_metadata JSON")
        providerMetadata = {}
      }
    }
    const currentPasswordHash = providerMetadata?.password

    console.log(`[password-history] Checking password reuse for auth_identity: ${authIdentityId}, has current hash: ${!!currentPasswordHash}`)

    // Get password history for this auth identity
    let passwordHistoryService: PasswordHistoryService | null = null
    try {
      passwordHistoryService = req.scope.resolve(PASSWORD_HISTORY_MODULE)
    } catch (e) {
      // Module not registered yet - skip history check but continue
      console.warn("[password-history] Password history module not available - skipping history check")
    }

    // Always check against current password (shouldn't set same password)
    // This check runs regardless of whether the password history module is available
    if (currentPasswordHash) {
      const matchesCurrent = await bcrypt.compare(newPassword, currentPasswordHash)
      if (matchesCurrent) {
        console.log(`[password-history] User tried to reuse current password for auth_identity: ${authIdentityId}`)
        return res.status(400).json({
          message: "New password must be different from your current password.",
          type: "password_same_as_current",
        })
      }
    }

    if (passwordHistoryService) {
      // Get historical password hashes
      const historyEntries = await passwordHistoryService.listPasswordHistoryEntries(
        { auth_identity_id: authIdentityId },
        {
          order: { created_at: "DESC" },
          take: PASSWORD_HISTORY_CONFIG.maxHistoryCount || 100,
        }
      )

      // Check if new password matches any historical password
      for (const entry of historyEntries) {
        const isMatch = await bcrypt.compare(newPassword, entry.password_hash)
        if (isMatch) {
          console.log(`[password-history] Password reuse detected for auth_identity: ${authIdentityId}`)
          return res.status(400).json({
            message: "This password has been used before. Please choose a different password.",
            type: "password_reuse",
          })
        }
      }
    }

    // Store the current password hash after successful update
    // We use response interception to do this
    const originalSend = res.send.bind(res)
    res.send = function (data: any) {
      // Only store history on successful responses
      if (res.statusCode >= 200 && res.statusCode < 300 && currentPasswordHash && passwordHistoryService) {
        // Store the old password hash asynchronously (don't block response)
        passwordHistoryService
          .createPasswordHistoryEntries([
            {
              auth_identity_id: authIdentityId,
              actor_type: getActorTypeFromPath(req.path),
              password_hash: currentPasswordHash,
            },
          ])
          .then(() => {
            console.log(`[password-history] Stored old password hash for auth_identity: ${authIdentityId}`)
          })
          .catch((err) => {
            console.error("[password-history] Failed to store password history:", err)
          })
      }
      return originalSend(data)
    }

    next()
  } catch (error) {
    console.error("[password-history] Error checking password history:", error)
    // Don't block password reset on error - log and continue
    next()
  }
}

/**
 * Extract actor type from request path
 * e.g., /auth/seller/emailpass/update -> "seller"
 */
function getActorTypeFromPath(path: string): string {
  const match = path.match(/\/auth\/([^/]+)\//)
  return match?.[1] || "unknown"
}
