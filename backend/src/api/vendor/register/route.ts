import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { handleSellerRegistration } from "../../shared/seller-registration"

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
  return handleSellerRegistration(req, res)
}
