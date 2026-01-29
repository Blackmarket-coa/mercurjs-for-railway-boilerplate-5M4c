import type { MedusaResponse } from "@medusajs/framework/http"

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
export function requireSellerId(req: AuthenticatedRequest, res: MedusaResponse): string | null {
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
    return null
  }
  return sellerId
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
