import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"
import { createSellerSchema, CreateSellerInput } from "./validators"

// Disable automatic authentication to allow public registration
export const AUTHENTICATE = false

/**
 * Request type identifier for seller creation requests
 */
const SELLER_REQUEST_TYPE = "seller_creation"

/**
 * POST /vendor/sellers
 *
 * Create a seller creation REQUEST during vendor registration.
 * This endpoint is called after the auth registration to submit a seller creation request.
 * The request will appear in the admin panel for approval.
 * Once approved, the seller entity will be created via the admin approval endpoint.
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Manually validate request body using Zod schema
  let body: CreateSellerInput
  try {
    body = createSellerSchema.parse(req.body)
  } catch (validationError: any) {
    console.error("[POST /vendor/sellers] Validation error:", validationError)
    return res.status(400).json({
      type: "invalid_data",
      message: validationError.errors?.[0]?.message || "Invalid request data",
      errors: validationError.errors,
    })
  }

  console.log("[POST /vendor/sellers] Creating seller request:", body.name)

  try {
    // Look up the auth identity by email (created during auth registration)
    const authModule = req.scope.resolve(Modules.AUTH)
    const [authIdentity] = await authModule.listAuthIdentities({
      provider_identities: {
        entity_id: body.member.email,
      },
    })

    if (!authIdentity) {
      console.error("[POST /vendor/sellers] Auth identity not found for email:", body.member.email)
      return res.status(400).json({
        type: "invalid_data",
        message: "Please complete authentication registration first",
      })
    }

    console.log("[POST /vendor/sellers] Found auth identity:", authIdentity.id)

    // Create a seller creation REQUEST using the custom Request module
    // This will appear in the admin panel for approval
    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const sellerRequest = await requestService.createRequest({
      type: "seller",
      data: {
        auth_identity_id: authIdentity.id,
        member: {
          name: body.member.name,
          email: body.member.email,
        },
        seller: {
          name: body.name,
        },
        // Store vendor_type selection (defaults to "producer" if not provided)
        vendor_type: body.vendor_type || "producer",
      },
      submitter_id: authIdentity.id,
      reviewer_note: `Seller registration request for "${body.name}" by ${body.member.email}`,
    })

    console.log("[POST /vendor/sellers] Created seller request:", sellerRequest)

    return res.status(201).json({
      request: {
        id: sellerRequest.id,
        status: sellerRequest.status || "pending",
        message: "Your seller registration request has been submitted and is pending approval.",
      },
    })
  } catch (error: any) {
    console.error("Failed to create seller request:", error)

    // Return proper error response
    return res.status(400).json({
      type: "invalid_data",
      message: error.message || "Failed to submit seller registration request",
    })
  }
}
