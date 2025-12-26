import { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function isDeliveryDriver(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  // TODO: Implement driver validation logic
  // For now, just pass through
  next()
}
