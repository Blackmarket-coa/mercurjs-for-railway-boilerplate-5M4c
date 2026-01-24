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

    // When filtering by type, we need to fetch more records initially
    // because we'll filter by payload.type in memory
    let requests = await requestService.listRequests(filters, {
      skip: query.type ? 0 : query.offset,
      take: query.type ? 1000 : query.limit, // Fetch more when type filter is needed
    })

    // Map frontend type parameter to payload.type value
    // Frontend sends "seller" but payload.type is "seller_creation"
    const typeMap: Record<string, string> = {
      seller: "seller_creation",
    }

    // Filter by type if provided (filtering on JSON field)
    if (query.type) {
      const payloadType = typeMap[query.type] || query.type
      requests = requests.filter((request: any) => {
        return request.payload?.type === payloadType
      })

      // Apply pagination after filtering
      const totalCount = requests.length
      requests = requests.slice(query.offset, query.offset + query.limit)

      res.json({
        requests,
        count: totalCount,
        offset: query.offset,
        limit: query.limit,
      })
      return
    }

    // Debug logging for first request to see payload structure
    if (requests.length > 0) {
      console.log("[GET /admin/requests] Sample request:", {
        id: requests[0].id,
        payload: requests[0].payload,
        payload_type: typeof requests[0].payload,
        payload_keys: requests[0].payload ? Object.keys(requests[0].payload) : [],
      })
    }

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
