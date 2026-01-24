import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../../../modules/request"
import RequestModuleService from "../../../../../modules/request/service"
import { RequestStatus } from "../../../../../modules/request/models"
import { createSellerWorkflow } from "@mercurjs/b2c-core/workflows"
import { createSellerMetadataWorkflow } from "../../../../../workflows/create-seller-metadata"
import { VendorType } from "../../../../../modules/seller-extension/models/seller-metadata"

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

    const data = request.data as Record<string, unknown>

    // Handle seller creation requests
    if (request.type === "seller" || request.type === SELLER_REQUEST_TYPE) {
      const authIdentityId = data.auth_identity_id as string
      const member = data.member as { name: string; email: string }
      const seller = data.seller as { name: string }
      const vendorType = (data.vendor_type as string) || "producer"

      if (!authIdentityId || !member || !seller) {
        res.status(400).json({
          message: "Invalid seller creation request data",
        })
        return
      }

      console.log(`[Approve] Creating seller "${seller.name}" for ${member.email} with vendor_type: ${vendorType}`)

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

      // Create seller metadata with the correct vendor_type from registration
      // Note: The subscriber will also try to create metadata, but we create it here first
      // with the correct vendor_type to preserve the user's selection
      try {
        // Map string vendor_type to VendorType enum
        const vendorTypeEnum = VendorType[vendorType.toUpperCase() as keyof typeof VendorType] || VendorType.PRODUCER

        await createSellerMetadataWorkflow.run({
          container: req.scope,
          input: {
            seller_id: createdSeller.id,
            vendor_type: vendorTypeEnum,
          },
        })

        console.log(`[Approve] Seller metadata created with vendor_type: ${vendorTypeEnum}`)
      } catch (error: any) {
        console.error(`[Approve] Failed to create seller metadata:`, error)
        // Don't fail the entire request if metadata creation fails
        // The subscriber will create it with default type as fallback
      }

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
