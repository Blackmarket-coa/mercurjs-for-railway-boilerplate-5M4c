import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"
import { RequestStatus } from "../../../modules/request/models"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const createRequestSchema = z.object({
  type: z.string().min(1, "Request type is required"),
  data: z.record(z.unknown()).default({}),
  requester_id: z.string().min(1, "Requester ID is required"),
  reviewer_note: z.string().optional(),
})

const listRequestsSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  requester_id: z.string().optional(),
  type: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
})

// ===========================================
// GET /admin/requests
// List all requests (admin view)
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const query = listRequestsSchema.parse(req.query)

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const filters: Record<string, unknown> = {}
    if (query.status) filters.status = query.status
    if (query.requester_id) filters.requester_id = query.requester_id
    if (query.type) filters.type = query.type

    const requests = await requestService.listRequests(filters, {
      skip: query.offset,
      take: query.limit,
    })

    res.json({
      requests,
      count: requests.length,
      offset: query.offset,
      limit: query.limit,
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
// POST /admin/requests
// Create a request on behalf of a customer
// ===========================================

export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const body = createRequestSchema.parse(req.body)

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const request = await requestService.createRequest({
      type: body.type,
      data: body.data,
      requester_id: body.requester_id,
      reviewer_note: body.reviewer_note,
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
