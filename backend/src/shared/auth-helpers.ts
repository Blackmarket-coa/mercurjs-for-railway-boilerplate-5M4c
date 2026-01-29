import type { MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

/**
 * Authentication context from MedusaJS
 */
interface AuthContext {
  actor_id?: string
  actor_type?: string
  auth_identity_id?: string
  app_metadata?: Record<string, unknown>
}

/**
 * Request with authentication context
 */
interface AuthenticatedRequest {
  auth_context?: AuthContext
  scope?: {
    resolve: (key: string) => any
  }
}

/**
 * Result type for auth extraction
 */
type AuthResult<T> = 
  | { success: true; id: T }
  | { success: false; error: string; status: number }

/**
 * Extract seller ID from authenticated request
 * 
 * @example
 * ```typescript
 * const result = extractSellerId(req, res)
 * if (!result.success) return // Response already sent
 * const sellerId = result.id
 * ```
 */
export function extractSellerId(
  req: AuthenticatedRequest,
  res: MedusaResponse
): AuthResult<string> {
  const sellerId =
    req.auth_context?.actor_id ??
    (typeof req.auth_context?.app_metadata?.seller_id === "string"
      ? req.auth_context?.app_metadata?.seller_id
      : undefined)

  if (!sellerId) {
    res.status(401).json({ 
      message: "Unauthorized - seller authentication required",
      type: "unauthorized"
    })
    return { success: false, error: "Unauthorized", status: 401 }
  }

  return { success: true, id: sellerId }
}

/**
 * Extract customer ID from authenticated request
 * 
 * @example
 * ```typescript
 * const result = extractCustomerId(req, res)
 * if (!result.success) return
 * const customerId = result.id
 * ```
 */
export function extractCustomerId(
  req: AuthenticatedRequest,
  res: MedusaResponse
): AuthResult<string> {
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({ 
      message: "Authentication required",
      type: "unauthorized"
    })
    return { success: false, error: "Unauthorized", status: 401 }
  }

  return { success: true, id: customerId }
}

/**
 * Extract driver ID from authenticated request
 */
export function extractDriverId(
  req: AuthenticatedRequest,
  res: MedusaResponse
): AuthResult<string> {
  const driverId = req.auth_context?.actor_id

  if (!driverId) {
    res.status(401).json({ 
      message: "Driver authentication required",
      type: "unauthorized"
    })
    return { success: false, error: "Unauthorized", status: 401 }
  }

  return { success: true, id: driverId }
}

/**
 * Extract admin user ID from authenticated request
 */
export function extractAdminId(
  req: AuthenticatedRequest,
  res: MedusaResponse
): AuthResult<string> {
  const adminId = req.auth_context?.actor_id

  if (!adminId) {
    res.status(401).json({ 
      message: "Admin authentication required",
      type: "unauthorized"
    })
    return { success: false, error: "Unauthorized", status: 401 }
  }

  return { success: true, id: adminId }
}

/**
 * Require seller ID - returns null if not authenticated and sends response
 * @param req - The authenticated request
 * @param res - The response object to send error if not authenticated
 * @returns The seller ID or null if not authenticated
 */
export async function requireSellerId(
  req: AuthenticatedRequest,
  res: MedusaResponse
): Promise<string | null> {
  const actorId = req.auth_context?.actor_id
  const authIdentityId = req.auth_context?.auth_identity_id
  const authMetadataSellerId =
    typeof req.auth_context?.app_metadata?.seller_id === "string"
      ? req.auth_context?.app_metadata?.seller_id
      : null

  const query = req.scope?.resolve?.(ContainerRegistrationKeys.QUERY)
  const authModule = req.scope?.resolve?.(Modules.AUTH)

  const resolveSellerIdFromMember = async (memberId: string) => {
    if (!query) return null

    const { data: sellers } = await query.graph({
      entity: "seller",
      filters: {
        members: {
          id: memberId,
        },
      },
      fields: ["id"],
    })

    return (sellers?.[0] as { id: string } | undefined)?.id ?? null
  }

  if (actorId) {
    if (actorId.startsWith("sel_")) {
      return actorId
    }

    const sellerId = await resolveSellerIdFromMember(actorId)
    if (sellerId) {
      return sellerId
    }
  }

  if (authMetadataSellerId) {
    if (authMetadataSellerId.startsWith("sel_")) {
      return authMetadataSellerId
    }

    const sellerId = await resolveSellerIdFromMember(authMetadataSellerId)
    if (sellerId) {
      return sellerId
    }
  }

  if (authIdentityId && authModule) {
    const identities = await authModule.listAuthIdentities({ id: [authIdentityId] })
    const authIdentity = identities?.[0]
    const appMetadata = authIdentity?.app_metadata as Record<string, unknown> | undefined
    const linkedSellerId =
      typeof appMetadata?.seller_id === "string" ? appMetadata.seller_id : null

    if (linkedSellerId) {
      if (linkedSellerId.startsWith("sel_")) {
        return linkedSellerId
      }

      const sellerId = await resolveSellerIdFromMember(linkedSellerId)
      if (sellerId) {
        return sellerId
      }
    }
  }

  res.status(401).json({
    message: "Unauthorized - seller authentication required",
    type: "unauthorized",
  })
  return null
}

/**
 * Require customer ID - returns null if not authenticated and sends response
 * @param req - The authenticated request
 * @param res - The response object to send error if not authenticated
 * @returns The customer ID or null if not authenticated
 */
export function requireCustomerId(req: AuthenticatedRequest, res: MedusaResponse): string | null {
  const customerId = req.auth_context?.actor_id
  if (!customerId) {
    res.status(401).json({
      message: "Authentication required",
      type: "unauthorized"
    })
    return null
  }
  return customerId
}

/**
 * Require admin ID - returns null if not authenticated and sends response
 * @param req - The authenticated request
 * @param res - The response object to send error if not authenticated
 * @returns The admin ID or null if not authenticated
 */
export function requireAdminId(req: AuthenticatedRequest, res: MedusaResponse): string | null {
  const adminId = req.auth_context?.actor_id
  if (!adminId) {
    res.status(401).json({
      message: "Admin authentication required",
      type: "unauthorized"
    })
    return null
  }
  return adminId
}

/**
 * Require driver ID - returns null if not authenticated and sends response
 * @param req - The authenticated request
 * @param res - The response object to send error if not authenticated
 * @returns The driver ID or null if not authenticated
 */
export function requireDriverId(req: AuthenticatedRequest, res: MedusaResponse): string | null {
  const driverId = req.auth_context?.actor_id
  if (!driverId) {
    res.status(401).json({
      message: "Driver authentication required",
      type: "unauthorized"
    })
    return null
  }
  return driverId
}
