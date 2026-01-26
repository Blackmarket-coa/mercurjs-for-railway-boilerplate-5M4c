import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"

/**
 * GET /vendor/registration-status
 *
 * Check the registration status for the authenticated user.
 * This endpoint helps the vendor panel determine if a user:
 * - Has an approved seller account (can access dashboard)
 * - Has a pending registration request (should see pending page)
 * - Has no registration at all (should complete registration)
 *
 * This endpoint uses bearer auth but doesn't require a seller_id,
 * allowing newly registered users to check their status.
 */
export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    // Get auth_identity_id from the auth context
    // This is available even if no seller has been created yet
    const authIdentityId = req.auth_context?.auth_identity_id
    const sellerId = req.auth_context?.actor_id

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
        message: "Authentication required. Please log in or register.",
      })
    }

    // Look up the auth_identity to check app_metadata
    const authModule = req.scope.resolve(Modules.AUTH)
    const authIdentities = await authModule.listAuthIdentities({
      id: [authIdentityId],
    })

    if (!authIdentities || authIdentities.length === 0) {
      return res.status(401).json({
        status: "unauthenticated",
        message: "Invalid authentication. Please log in again.",
      })
    }

    const authIdentity = authIdentities[0]

    // Double-check app_metadata for seller_id (in case auth_context didn't have it)
    const appMetadata = authIdentity.app_metadata as Record<string, unknown> | undefined
    if (appMetadata?.seller_id) {
      return res.json({
        status: "approved",
        seller_id: appMetadata.seller_id,
        message: "Your seller account is approved. You can access the vendor dashboard.",
      })
    }

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

    // Return status based on request status
    switch (latestRequest.status) {
      case "pending":
        return res.json({
          status: "pending",
          request_id: latestRequest.id,
          message: "Your registration request is pending approval. Please wait for an administrator to review your application.",
          created_at: latestRequest.created_at,
        })

      case "accepted":
        // Request was accepted but seller_id wasn't linked properly
        // This shouldn't normally happen, but handle it gracefully
        return res.json({
          status: "approved",
          request_id: latestRequest.id,
          message: "Your registration has been approved. If you cannot access the dashboard, please contact support.",
        })

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
