import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"

// Allow this endpoint to be accessed without seller authentication
// We'll verify the token manually to support pending users
export const AUTHENTICATE = false

/**
 * GET /vendor/registration-status
 *
 * Check the registration status for the authenticated user.
 * This endpoint helps the vendor panel determine if a user:
 * - Has an approved seller account (can access dashboard)
 * - Has a pending registration request (should see pending page)
 * - Has no registration at all (should complete registration)
 *
 * This endpoint verifies the bearer token manually to support pending users
 * who have an auth_identity but no seller_id yet.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  console.log("[GET /vendor/registration-status] Handler reached - AUTHENTICATE=false should have bypassed auth middleware")

  try {
    // Extract bearer token from Authorization header
    const authHeader = req.headers.authorization
    console.log(`[GET /vendor/registration-status] Auth header present: ${!!authHeader}`)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("[GET /vendor/registration-status] No Bearer token found")
      return res.status(401).json({
        status: "unauthenticated",
        message: "Authentication required. Please provide a valid bearer token.",
      })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix
    console.log(`[GET /vendor/registration-status] Token length: ${token.length}`)

    // Verify the token using MedusaJS auth module
    const authModule = req.scope.resolve(Modules.AUTH)

    // Decode JWT token to get auth_identity_id
    // MedusaJS uses JWT tokens with auth_identity_id in the payload
    let authIdentityId: string | null = null
    let sellerId: string | null = null

    try {
      const tokenParts = token.split(".")
      if (tokenParts.length === 3) {
        // Handle both standard and URL-safe base64 encoding
        const base64Payload = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')
        const paddedPayload = base64Payload + '='.repeat((4 - base64Payload.length % 4) % 4)
        const payload = JSON.parse(Buffer.from(paddedPayload, "base64").toString("utf-8"))

        console.log(`[GET /vendor/registration-status] JWT payload fields: ${Object.keys(payload).join(', ')}`)

        // Try multiple field names for auth identity ID
        authIdentityId = payload.auth_identity_id || payload.sub || payload.identity_id || payload.user_id
        // Try multiple field names for seller ID
        sellerId = payload.actor_id || payload.seller_id || payload.app_metadata?.seller_id

        console.log(`[GET /vendor/registration-status] Decoded - authIdentityId: ${authIdentityId ? 'found' : 'null'}, sellerId: ${sellerId ? 'found' : 'null'}`)
      }
    } catch (decodeError: any) {
      console.log(`[GET /vendor/registration-status] JWT decode error: ${decodeError.message}`)
    }

    // If we couldn't get auth_identity_id from token, try the auth context (populated by middleware if any)
    if (!authIdentityId && (req as any).auth_context?.auth_identity_id) {
      authIdentityId = (req as any).auth_context.auth_identity_id
      sellerId = (req as any).auth_context.actor_id
      console.log(`[GET /vendor/registration-status] Got auth from context - authIdentityId: ${!!authIdentityId}, sellerId: ${!!sellerId}`)
    }

    // If we have a seller_id, the user is approved
    if (sellerId) {
      return res.json({
        status: "approved",
        seller_id: sellerId,
        message: "Your seller account is approved. You can access the vendor dashboard.",
      })
    }

    // No seller_id - check if we have an auth_identity to look up requests
    if (!authIdentityId) {
      return res.status(401).json({
        status: "unauthenticated",
        message: "Invalid or expired authentication. Please log in again.",
      })
    }

    // Look up the auth_identity to verify it exists and check app_metadata
    const authIdentities = await authModule.listAuthIdentities({
      id: [authIdentityId],
    })

    if (!authIdentities || authIdentities.length === 0) {
      console.log(`[GET /vendor/registration-status] Auth identity not found: ${authIdentityId}`)
      return res.status(401).json({
        status: "unauthenticated",
        message: "Invalid authentication. Please log in again.",
      })
    }

    const authIdentity = authIdentities[0]
    console.log(`[GET /vendor/registration-status] Auth identity found, app_metadata:`, JSON.stringify(authIdentity.app_metadata))

    // Double-check app_metadata for seller_id (in case it wasn't in the token)
    const appMetadata = authIdentity.app_metadata as Record<string, unknown> | undefined
    if (appMetadata?.seller_id) {
      console.log(`[GET /vendor/registration-status] Found seller_id in app_metadata: ${appMetadata.seller_id}`)
      return res.json({
        status: "approved",
        seller_id: appMetadata.seller_id,
        message: "Your seller account is approved. You can access the vendor dashboard.",
      })
    }

    console.log(`[GET /vendor/registration-status] No seller_id in app_metadata, checking pending requests...`)

    // No seller_id in app_metadata - check for pending requests
    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    // Find requests for this auth identity
    const requests = await requestService.listRequests({
      type: "seller",
    })

    // Filter to find requests that belong to this auth identity
    // The auth_identity_id is stored in the request data
    const userRequests = requests.filter((request) => {
      const data = request.data as Record<string, unknown> | undefined
      return data?.auth_identity_id === authIdentityId
    })

    console.log(`[GET /vendor/registration-status] Found ${userRequests.length} requests for this user`)

    if (userRequests.length === 0) {
      // No requests found - user needs to complete registration
      return res.json({
        status: "no_request",
        message: "No registration request found. Please complete the registration process.",
      })
    }

    // Find the most recent request
    const sortedRequests = userRequests.sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime()
      const dateB = new Date(b.created_at || 0).getTime()
      return dateB - dateA
    })
    const latestRequest = sortedRequests[0]

    console.log(`[GET /vendor/registration-status] Latest request status: ${latestRequest.status}, id: ${latestRequest.id}`)

    // Return status based on request status
    switch (latestRequest.status) {
      case "pending":
        return res.json({
          status: "pending",
          request_id: latestRequest.id,
          message: "Your registration request is pending approval. Please wait for an administrator to review your application.",
          created_at: latestRequest.created_at,
        })

      case "accepted": {
        // Request was accepted but seller_id wasn't linked to auth_identity
        // Try to find the seller and link it
        console.log(`[GET /vendor/registration-status] Request accepted but no seller_id in app_metadata, looking up seller...`)

        const requestData = latestRequest.data as Record<string, unknown> | undefined
        const memberEmail = (requestData?.member as any)?.email

        if (memberEmail) {
          try {
            const { ContainerRegistrationKeys } = await import("@medusajs/framework/utils")
            const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

            // Find seller by member email
            const { data: sellers } = await query.graph({
              entity: "seller",
              fields: ["id", "name", "members.*"],
              filters: {},
            })

            const existingSeller = sellers?.find((s: any) => {
              return s.members?.some((m: any) => m.email === memberEmail)
            })

            if (existingSeller) {
              console.log(`[GET /vendor/registration-status] Found seller ${existingSeller.id}, updating auth_identity...`)

              // Update auth_identity with seller_id
              await authModule.updateAuthIdentities([{
                id: authIdentityId,
                app_metadata: {
                  seller_id: existingSeller.id,
                },
              }])

              console.log(`[GET /vendor/registration-status] Auth identity updated with seller_id`)

              return res.json({
                status: "approved",
                seller_id: existingSeller.id,
                request_id: latestRequest.id,
                message: "Your seller account is approved. You can access the vendor dashboard.",
              })
            }
          } catch (lookupError: any) {
            console.error(`[GET /vendor/registration-status] Error looking up seller:`, lookupError.message)
          }
        }

        // Fallback if we can't find the seller
        return res.json({
          status: "approved",
          request_id: latestRequest.id,
          message: "Your registration has been approved. Please log out and log back in to access the dashboard.",
        })
      }

      case "rejected":
        return res.json({
          status: "rejected",
          request_id: latestRequest.id,
          message: "Your registration request was not approved. Please contact support for more information.",
          reviewer_note: latestRequest.reviewer_note,
        })

      case "cancelled":
        return res.json({
          status: "cancelled",
          request_id: latestRequest.id,
          message: "Your registration request was cancelled. You may submit a new registration.",
        })

      default:
        return res.json({
          status: "unknown",
          request_id: latestRequest.id,
          message: "Unable to determine registration status. Please contact support.",
        })
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[GET /vendor/registration-status] Error:", errorMessage)
    return res.status(500).json({
      status: "error",
      message: "Failed to check registration status. Please try again later.",
    })
  }
}
