import { z } from "zod"
import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../../../modules/request"
import RequestModuleService from "../../../../../modules/request/service"
import { RequestStatus } from "../../../../../modules/request/models"

const rejectSchema = z.object({
  reason: z.string().optional(),
})

/**
 * POST /admin/requests/:id/reject
 *
 * Reject a request with an optional reason.
 */
export async function POST(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  try {
    const { reason } = rejectSchema.parse(req.body || {})

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    // Get the request
    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    const request = requests[0]

    // Check if already processed
    if (request.status !== RequestStatus.PENDING) {
      res.status(400).json({
        message: `Request has already been ${request.status}`,
      })
      return
    }

    // Update notes with rejection reason if provided
    if (reason) {
      await requestService.updateRequests(
        { id },
        { notes: `${request.notes || ""}\n\nRejection reason: ${reason}`.trim() }
      )
    }

    // Mark request as rejected
    await requestService.rejectRequest(id)

    console.log(`[Reject] Request ${id} rejected${reason ? `: ${reason}` : ""}`)

    res.json({
      message: "Request rejected",
      request: {
        id,
        status: RequestStatus.REJECTED,
        reason,
      },
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation failed", errors: error.errors })
      return
    }
    console.error("[Reject] Error rejecting request:", error)
    res.status(500).json({
      message: error.message || "Failed to reject request",
    })
  }
}
