import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getSellerRegistrationStatus } from "../../../../shared/seller-registration"

export const AUTHENTICATE = false

/**
 * GET /auth/seller/registration-status
 * Checks the registration status for the authenticated user.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { status, statusCode } = await getSellerRegistrationStatus(req)
  return res.status(statusCode).json(status)
}
