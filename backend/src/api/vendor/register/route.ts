import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"
import { REQUEST_TYPES } from "../../../modules/request/validators"
import { createSellerRegistrationSchema, CreateSellerRegistrationInput } from "./validators"
import { maskEmail } from "../../../shared/seller-approval-service"

// Disable automatic authentication to allow public registration
export const AUTHENTICATE = false

/**
 * POST /vendor/register
 *
 * Create a seller registration REQUEST during vendor signup.
 * This endpoint is called after the auth registration to submit a seller creation request.
 * The request will appear in the admin panel for approval.
 * Once approved, the seller entity will be created via the admin approval endpoint.
 *
 * This endpoint is separate from /vendor/sellers to avoid conflicts with
 * MercurJS's seller profile management routes.
 *
 * Rate limited to 5 requests per 15 minutes per IP address (configured in middlewares.ts).
 */
export const POST = async (
  req: MedusaRequest,
  res: MedusaResponse
) => {
  // Manually validate request body using Zod schema
  let body: CreateSellerRegistrationInput
  try {
    body = createSellerRegistrationSchema.parse(req.body)
  } catch (validationError: any) {
    console.error("[POST /vendor/register] Validation error")
    return res.status(400).json({
      type: "invalid_data",
      message: validationError.errors?.[0]?.message || "Invalid request data",
      errors: validationError.errors,
    })
  }

  console.log(`[POST /vendor/register] Creating seller request: "${body.name}" (email: ${maskEmail(body.member.email)})`)

  try {
    // Look up the auth identity by email (created during auth registration)
    const authModule = req.scope.resolve(Modules.AUTH)
    const [authIdentity] = await authModule.listAuthIdentities({
      provider_identities: {
        entity_id: body.member.email,
      },
    })

    if (!authIdentity) {
      console.error(`[POST /vendor/register] Auth identity not found for email: ${maskEmail(body.member.email)}`)
      return res.status(400).json({
        type: "invalid_data",
        message: "Please complete authentication registration first",
      })
    }

    console.log(`[POST /vendor/register] Found auth identity: ${authIdentity.id}`)

    // Check if there's already a pending request for this auth identity
    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)
    const existingRequests = await requestService.listRequests({
      type: REQUEST_TYPES.SELLER,
    })

    const userExistingRequest = existingRequests.find((request) => {
      const data = request.data as Record<string, unknown> | undefined
      return data?.auth_identity_id === authIdentity.id && request.status === "pending"
    })

    if (userExistingRequest) {
      console.log(`[POST /vendor/register] Found existing pending request: ${userExistingRequest.id}`)
      return res.status(200).json({
        request: {
          id: userExistingRequest.id,
          status: userExistingRequest.status || "pending",
          message: "You already have a pending registration request. Please wait for admin approval.",
        },
      })
    }

    // Create a seller creation REQUEST using the custom Request module
    // This will appear in the admin panel for approval
    const sellerRequest = await requestService.createRequest({
      type: REQUEST_TYPES.SELLER,
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
      reviewer_note: `Seller registration request for "${body.name}"`,
    })

    console.log(`[POST /vendor/register] Created seller request: ${sellerRequest.id}`)

    return res.status(201).json({
      request: {
        id: sellerRequest.id,
        status: sellerRequest.status || "pending",
        message: "Your seller registration request has been submitted and is pending approval.",
      },
    })
  } catch (error: any) {
    console.error("[POST /vendor/register] Failed to create seller request:", error.message)

    // Return proper error response
    return res.status(400).json({
      type: "invalid_data",
      message: error.message || "Failed to submit seller registration request",
    })
  }
}
