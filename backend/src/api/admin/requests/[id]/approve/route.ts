import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../../../modules/request"
import RequestModuleService from "../../../../../modules/request/service"
import { RequestStatus } from "../../../../../modules/request/models"
import { createSellerWorkflow } from "@mercurjs/b2c-core/workflows"

/**
 * Request type identifier for seller creation requests
 */
const SELLER_REQUEST_TYPE = "seller_creation"

/**
 * POST /admin/requests/:id/approve
 *
 * Approve a request. For seller creation requests, this will:
 * 1. Create the seller using MercurJS workflow
 * 2. Mark the request as accepted
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    // Get the request
    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    const request = requests[0]

    // Check if already processed
    if (request.status !== RequestStatus.PENDING) {
      res.status(400).json({
        message: `Request has already been ${request.status}`,
      })
      return
    }

    const payload = request.payload as Record<string, unknown>

    // Handle seller creation requests
    if (payload?.type === SELLER_REQUEST_TYPE) {
      const authIdentityId = payload.auth_identity_id as string
      const member = payload.member as { name: string; email: string }
      const seller = payload.seller as { name: string }

      if (!authIdentityId || !member || !seller) {
        res.status(400).json({
          message: "Invalid seller creation request data",
        })
        return
      }

      console.log(`[Approve] Creating seller "${seller.name}" for ${member.email}`)

      // Create the seller using MercurJS workflow
      const { result: createdSeller } = await createSellerWorkflow.run({
        container: req.scope,
        input: {
          auth_identity_id: authIdentityId,
          member: {
            name: member.name,
            email: member.email,
          },
          seller: {
            name: seller.name,
          },
        },
      })

      console.log(`[Approve] Seller created:`, createdSeller)

      // Mark request as accepted
      await requestService.acceptRequest(id)

      res.json({
        message: "Seller registration approved successfully",
        seller: createdSeller,
        request: {
          id,
          status: RequestStatus.ACCEPTED,
        },
      })
      return
    }

    // For other request types, just mark as accepted
    await requestService.acceptRequest(id)

    res.json({
      message: "Request approved successfully",
      request: {
        id,
        status: RequestStatus.ACCEPTED,
      },
    })
  } catch (error: any) {
    console.error("[Approve] Error approving request:", error)
    res.status(500).json({
      message: error.message || "Failed to approve request",
    })
  }
}
