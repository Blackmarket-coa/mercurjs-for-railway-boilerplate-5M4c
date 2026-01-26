import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../../../../modules/request"
import RequestModuleService from "../../../../modules/request/service"
import { RequestStatus } from "../../../../modules/request/models"
import { createSellerWorkflow } from "@mercurjs/b2c-core/workflows"
import { createSellerMetadataWorkflow } from "../../../../workflows/create-seller-metadata"
import { VendorType } from "../../../../modules/seller-extension/models/seller-metadata"
import { getRocketChatService } from "../../../../shared/rocketchat-service"
import crypto from "crypto"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const updateRequestSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  provider_id: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

const reviewRequestSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  reviewer_note: z.string().optional(),
})

// ===========================================
// GET /admin/requests/:id
// Get a specific request
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    res.json({ request: requests[0] })
  } catch (error) {
    throw error
  }
}

// ===========================================
// POST /admin/requests/:id
// Review a request (accept/reject) - called by admin panel
// ===========================================

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    // Validate the review payload
    const { status, reviewer_note } = reviewRequestSchema.parse(req.body)

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

    // Update reviewer note if provided
    if (reviewer_note) {
      await requestService.updateRequests(
        { id },
        { reviewer_note: `${request.reviewer_note || ""}\n${reviewer_note}`.trim() }
      )
    }

    // Handle REJECTION
    if (status === "rejected") {
      await requestService.rejectRequest(id)

      console.log(`[POST /admin/requests/:id] Request ${id} rejected`)

      res.json({
        message: "Request rejected",
        request: {
          id,
          status: RequestStatus.REJECTED,
        },
      })
      return
    }

    // Handle ACCEPTANCE - For seller requests, create the seller
    const data = request.data as Record<string, unknown>

    if (request.type === "seller" || request.type === "seller_creation") {
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

      console.log(`[POST /admin/requests/:id] Creating seller "${seller.name}" for ${member.email} with vendor_type: ${vendorType}`)

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

      console.log(`[POST /admin/requests/:id] Seller created:`, createdSeller)

      // CRITICAL: Update auth_identity with seller_id in app_metadata
      try {
        const authModule = req.scope.resolve(Modules.AUTH)
        await authModule.updateAuthIdentities([{
          id: authIdentityId,
          app_metadata: {
            seller_id: createdSeller.id,
          },
        }])
        console.log(`[POST /admin/requests/:id] Updated auth_identity ${authIdentityId} with seller_id: ${createdSeller.id}`)
      } catch (authError: any) {
        console.error(`[POST /admin/requests/:id] Failed to update auth_identity:`, authError)
        throw new Error(`Failed to link authentication: ${authError.message}`)
      }

      // Create seller metadata with the correct vendor_type
      try {
        const vendorTypeEnum = VendorType[vendorType.toUpperCase() as keyof typeof VendorType] || VendorType.PRODUCER

        await createSellerMetadataWorkflow.run({
          container: req.scope,
          input: {
            seller_id: createdSeller.id,
            vendor_type: vendorTypeEnum,
          },
        })

        console.log(`[POST /admin/requests/:id] Seller metadata created with vendor_type: ${vendorTypeEnum}`)
      } catch (error: any) {
        console.error(`[POST /admin/requests/:id] Failed to create seller metadata:`, error)
        // Don't fail - the subscriber will create it with default type
      }

      // Create RocketChat user and channel
      const rocketchatService = getRocketChatService()
      if (rocketchatService) {
        try {
          const rocketchatPassword = crypto.randomBytes(32).toString("hex")
          const username = createdSeller.handle || member.email.split("@")[0]

          const { userId: rocketchatUserId, username: rocketchatUsername } = await rocketchatService.createUser(
            member.name,
            member.email,
            username,
            rocketchatPassword
          )

          const channelName = await rocketchatService.createSellerChannel(
            createdSeller.id,
            seller.name
          )

          await rocketchatService.addUserToChannel(channelName, rocketchatUsername)
          await rocketchatService.addUserToChannel("general", rocketchatUsername)

          console.log(`[POST /admin/requests/:id] RocketChat user created: ${rocketchatUsername}`)
        } catch (error: any) {
          console.error(`[POST /admin/requests/:id] Failed to create RocketChat user:`, error.message)
        }
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
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    console.error("[POST /admin/requests/:id] Error:", error)
    res.status(500).json({
      message: error.message || "Failed to review request",
    })
  }
}

// ===========================================
// PATCH /admin/requests/:id
// Update a request (admin action)
// ===========================================

export async function PATCH(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const data = updateRequestSchema.parse(req.body)

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    const updateData: Record<string, unknown> = {}

    if (data.status) updateData.status = data.status
    if (data.provider_id !== undefined) updateData.provider_id = data.provider_id
    if (data.payload) updateData.payload = data.payload
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await requestService.updateRequests({ id }, updateData)

    res.json({
      request: updated,
      message: "Request updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}

// ===========================================
// DELETE /admin/requests/:id
// Delete a request
// ===========================================

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    await requestService.deleteRequests(id)

    res.json({ message: "Request deleted successfully" })
  } catch (error) {
    throw error
  }
}
