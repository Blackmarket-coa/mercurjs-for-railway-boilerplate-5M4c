import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { createSellerWorkflow } from "@mercurjs/b2c-core/workflows"
import { createSellerSchema, CreateSellerInput } from "./validators"

// Disable automatic authentication to allow public registration
export const AUTHENTICATE = false

/**
 * POST /vendor/sellers
 *
 * Create a new seller during vendor registration.
 * This endpoint is called after the auth registration to create the seller entity.
 * Seller metadata (including vendor_type) is created by the seller-created subscriber.
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

  console.log("[POST /vendor/sellers] Creating seller:", body.name)

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

    // Create the seller using MercurJS workflow
    // The seller-created subscriber will automatically create metadata with default vendor_type
    const { result: seller } = await createSellerWorkflow.run({
      container: req.scope,
      input: {
        auth_identity_id: authIdentity.id,
        member: {
          name: body.member.name,
          email: body.member.email,
        },
        seller: {
          name: body.name,
        },
      },
    })

    return res.status(201).json({
      seller: {
        id: seller.id,
        name: seller.name,
        members: seller.members,
      },
    })
  } catch (error: any) {
    console.error("Failed to create seller:", error)

    // Return proper error response
    return res.status(400).json({
      type: "invalid_data",
      message: error.message || "Failed to create seller",
    })
  }
}
