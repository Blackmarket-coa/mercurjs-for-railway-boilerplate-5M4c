import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { createSellerCreationRequestWorkflow } from "@mercurjs/requests/workflows"
import { createSellerSchema, CreateSellerInput } from "./validators"

// Disable automatic authentication to allow public registration
export const AUTHENTICATE = false

/**
 * POST /vendor/sellers
 *
 * Create a seller creation REQUEST during vendor registration.
 * This endpoint is called after the auth registration to submit a seller creation request.
 * The request will appear in the admin panel for approval.
 * Once approved, the seller entity will be created automatically.
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

    // Create a seller creation REQUEST using MercurJS requests workflow
    // This will appear in the admin panel for approval
    const { result } = await createSellerCreationRequestWorkflow.run({
      container: req.scope,
      input: {
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
          provider_identity_id: body.member.email,
        },
        submitter_id: authIdentity.id,
      },
    })

    // The workflow returns an array of requests
    const sellerRequest = Array.isArray(result) ? result[0] : result

    return res.status(201).json({
      request: {
        id: sellerRequest.id,
        status: sellerRequest.status,
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
