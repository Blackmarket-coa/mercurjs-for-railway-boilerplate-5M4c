import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"
import { requireCustomerId } from "../../../shared"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const createRequestSchema = z.object({
  provider_id: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

// ===========================================
// GET /store/requests
// Get customer's requests
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireCustomerId(req, res)
    if (!customerId) return

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.getRequesterRequests(customerId)

    res.json({
      requests,
      count: requests.length,
    })
  } catch (error) {
    throw error
  }
}

// ===========================================
// POST /store/requests
// Create a new request (RFQ)
// ===========================================

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireCustomerId(req, res)
    if (!customerId) return

    const data = createRequestSchema.parse(req.body)

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const request = await requestService.createRequest({
      requester_id: customerId,
      provider_id: data.provider_id,
      payload: data.payload,
      notes: data.notes,
    })

    res.status(201).json({
      request,
      message: "Request created successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    throw error
  }
}
