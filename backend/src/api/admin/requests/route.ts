import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../modules/request"
import RequestModuleService from "../../../modules/request/service"
import { RequestStatus } from "../../../modules/request/models"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const createRequestSchema = z.object({
  requester_id: z.string().min(1, "Requester ID is required"),
  provider_id: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

const listRequestsSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  requester_id: z.string().optional(),
  provider_id: z.string().optional(),
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
    if (query.provider_id) filters.provider_id = query.provider_id

    // Map frontend type parameter to database type value
    // Frontend sends "seller" but database stores "seller_creation"
    // Note: type is a direct column in the database, not inside JSON
    const typeMap: Record<string, string> = {
      seller: "seller_creation",
    }

    if (query.type) {
      const dbType = typeMap[query.type] || query.type
      filters.type = dbType
    }

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
    const data = createRequestSchema.parse(req.body)

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const request = await requestService.createRequest({
      requester_id: data.requester_id,
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
