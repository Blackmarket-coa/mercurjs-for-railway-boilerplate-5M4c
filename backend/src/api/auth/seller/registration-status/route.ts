import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../../../../modules/request"
import RequestModuleService from "../../../../modules/request/service"
import { config } from "../../../../shared/config"
import jwt from "jsonwebtoken"

export const AUTHENTICATE = false

/**
 * GET /auth/seller/registration-status
 * Checks the registration status for the authenticated user.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log("[GET /auth/seller/registration-status] Handler reached")

  try {
    const token = extractBearerToken(req)
    if (!token) {
      return res.status(401).json({
        status: "unauthenticated",
        message: "Authentication required. Please provide a valid bearer token.",
      })
    }

    const authModule = req.scope.resolve(Modules.AUTH)

    const { authIdentityId, sellerId } = await decodeAndVerifyToken(token, req)

    // If user already has sellerId, they are approved
    if (sellerId) {
      const seller = await findSellerById(req, sellerId)
      if (seller) {
        return res.json({
          status: "approved",
          seller_id: sellerId,
          message: "Your seller account is approved. You can access the vendor dashboard.",
        })
      }

      console.warn("[GET /auth/seller/registration-status] Seller ID present in token but not found:", sellerId)
    }

    if (!authIdentityId) {
      return res.status(401).json({
        status: "unauthenticated",
        message: "Invalid or expired authentication. Please log in again.",
      })
    }

    const authIdentity = await getAuthIdentity(authModule, authIdentityId)
    if (!authIdentity) {
      return res.status(401).json({
        status: "unauthenticated",
        message: "Invalid authentication. Please log in again.",
      })
    }

    const appMetadata = authIdentity.app_metadata as Record<string, unknown> | undefined
    if (appMetadata?.seller_id) {
      const seller = await findSellerById(req, String(appMetadata.seller_id))
      if (!seller) {
        console.warn(
          "[GET /auth/seller/registration-status] Seller ID present in auth metadata but not found:",
          appMetadata.seller_id
        )
      } else {
        return res.json({
          status: "approved",
          seller_id: appMetadata.seller_id,
          message: "Your seller account is approved. You can access the vendor dashboard.",
        })
      }
    }

    // No seller_id in token or metadata — check pending requests
    return await checkRequests(req, authIdentityId, authModule)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[GET /auth/seller/registration-status] Error:", message)
    return res.status(500).json({
      status: "error",
      message: "Failed to check registration status. Please try again later.",
    })
  }
}

/** Extracts the Bearer token from the Authorization header */
function extractBearerToken(req: MedusaRequest): string | null {
  const authHeader = req.headers.authorization
  console.log("[Token extraction] Bearer token present:", !!authHeader)
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  return authHeader.substring(7)
}

/** Decodes and verifies JWT, returns authIdentityId and sellerId */
async function decodeAndVerifyToken(token: string, req: MedusaRequest) {
  try {
    const payload = config.JWT_SECRET
      ? (jwt.verify(token, config.JWT_SECRET) as any)
      : (jwt.decode(token) as any)

    if (!config.JWT_SECRET) {
      console.warn("[JWT] JWT_SECRET not configured; token decoded without verification.")
    }
    console.log("[JWT] Decoded payload fields:", Object.keys(payload || {}).join(", "))

    let authIdentityId = payload?.auth_identity_id || payload?.sub || payload?.identity_id || payload?.user_id
    let sellerId = payload?.actor_id || payload?.seller_id || payload?.app_metadata?.seller_id

    // Fallback to auth_context if available
    if (!authIdentityId && (req as any).auth_context?.auth_identity_id) {
      authIdentityId = (req as any).auth_context.auth_identity_id
      sellerId = (req as any).auth_context.actor_id
      console.log("[Auth context fallback] authIdentityId:", !!authIdentityId, "sellerId:", !!sellerId)
    }

    return { authIdentityId, sellerId }
  } catch (err: any) {
    console.error("[JWT decode error]:", err.message)
    return { authIdentityId: null, sellerId: null }
  }
}

/** Fetches seller by id to ensure it exists before approving */
async function findSellerById(req: MedusaRequest, sellerId: string) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: ["id"],
    filters: { id: sellerId },
  })
  return sellers?.[0] ?? null
}

/** Fetches the auth identity from Medusa auth module */
async function getAuthIdentity(authModule: any, authIdentityId: string) {
  const identities = await authModule.listAuthIdentities({ id: [authIdentityId] })
  if (!identities || identities.length === 0) return null
  console.log("[Auth identity] Found:", authIdentityId)
  return identities[0]
}

/** Checks pending requests for the user and resolves registration status */
async function checkRequests(req: MedusaRequest, authIdentityId: string, authModule: any) {
  const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)
  const userRequests = await requestService.listRequests(
    {
      type: "seller",
      submitter_id: authIdentityId,
    },
    {
      order: { created_at: "DESC" },
    }
  )
  console.log(`[Requests] Found ${userRequests.length} requests for authIdentityId: ${authIdentityId}`)

  if (userRequests.length === 0) {
    return req.res!.json({
      status: "no_request",
      message: "No registration request found. Please complete the registration process.",
    })
  }

  const latestRequest = userRequests[0]

  console.log(`[Requests] Latest request status: ${latestRequest.status}, id: ${latestRequest.id}`)

  switch (latestRequest.status) {
    case "pending":
      return req.res!.json({
        status: "pending",
        request_id: latestRequest.id,
        message: "Your registration request is pending approval. Please wait for an administrator to review your application.",
        created_at: latestRequest.created_at,
      })

    case "accepted":
      return await handleAcceptedRequest(req, latestRequest, authIdentityId, authModule)

    case "rejected":
      return req.res!.json({
        status: "rejected",
        request_id: latestRequest.id,
        message: "Your registration request was not approved. Please contact support for more information.",
        reviewer_note: latestRequest.reviewer_note,
      })

    case "cancelled":
      return req.res!.json({
        status: "cancelled",
        request_id: latestRequest.id,
        message: "Your registration request was cancelled. You may submit a new registration.",
      })

    default:
      return req.res!.json({
        status: "unknown",
        request_id: latestRequest.id,
        message: "Unable to determine registration status. Please contact support.",
      })
  }
}

/** Handles an accepted request: attempts to link a seller_id if missing */
async function handleAcceptedRequest(
  req: MedusaRequest,
  latestRequest: any,
  authIdentityId: string,
  authModule: any
) {
  try {
    const requestData = latestRequest.data as Record<string, any>
    const memberEmail = requestData?.member?.email

    if (memberEmail) {
      const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
      const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
      const memberResult = await pgConnection.raw(
        `
        SELECT seller_id
        FROM member
        WHERE email = $1
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [memberEmail]
      )
      const sellerId = memberResult.rows?.[0]?.seller_id

      if (sellerId) {
        const seller = await findSellerById(req, sellerId)
        if (seller) {
          console.log("[Accepted request] Found seller, updating auth_identity")
          await authModule.updateAuthIdentities([
            { id: authIdentityId, app_metadata: { seller_id: sellerId } },
          ])
          return req.res!.json({
            status: "approved",
            seller_id: sellerId,
            request_id: latestRequest.id,
            message: "Your seller account is approved. You can access the vendor dashboard.",
          })
        }
      }
    }

    // Fallback if no seller found
    return req.res!.json({
      status: "approved",
      request_id: latestRequest.id,
      message: "Your registration has been approved. Please log out and log back in to access the dashboard.",
    })
  } catch (err: any) {
    console.error("[Accepted request] Error:", err.message)
    return req.res!.json({
      status: "approved",
      request_id: latestRequest.id,
      message: "Your registration has been approved. Please log out and log back in to access the dashboard.",
    })
  }
}
