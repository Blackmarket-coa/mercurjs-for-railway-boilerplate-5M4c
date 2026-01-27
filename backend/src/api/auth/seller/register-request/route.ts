import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { handleSellerRegistration } from "../../../shared/seller-registration"

export const AUTHENTICATE = false

/**
 * POST /auth/seller/register-request
 *
 * Public endpoint used by the vendor panel to submit a seller registration request
 * without triggering vendor actor authentication.
 */
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  return handleSellerRegistration(req, res)
}
