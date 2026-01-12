import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../../modules/request"
import RequestModuleService from "../../../../modules/request/service"
import { RequestStatus } from "../../../../modules/request/models"

// ===========================================
// VALIDATION SCHEMAS
// ===========================================

const updateRequestSchema = z.object({
  status: z.nativeEnum(RequestStatus).optional(),
  provider_id: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
})

// ===========================================
// GET /admin/requests/:id
// Get a specific request
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    res.json({ request: requests[0] })
  } catch (error) {
    throw error
  }
}

// ===========================================
// PATCH /admin/requests/:id
// Update a request (admin action)
// ===========================================

export async function PATCH(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params
    const data = updateRequestSchema.parse(req.body)

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    const updateData: Record<string, unknown> = {
      id,
      updated_at: new Date(),
    }

    if (data.status) updateData.status = data.status
    if (data.provider_id !== undefined) updateData.provider_id = data.provider_id
    if (data.payload) updateData.payload = data.payload
    if (data.notes !== undefined) updateData.notes = data.notes

    const updated = await requestService.updateRequests(updateData)

    res.json({
      request: updated,
      message: "Request updated successfully",
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
// DELETE /admin/requests/:id
// Delete a request
// ===========================================

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    await requestService.deleteRequests(id)

    res.json({ message: "Request deleted successfully" })
  } catch (error) {
    throw error
  }
}
