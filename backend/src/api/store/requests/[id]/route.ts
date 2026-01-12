import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { REQUEST_MODULE } from "../../../../modules/request"
import RequestModuleService from "../../../../modules/request/service"
import { requireCustomerId } from "../../../../shared"

// ===========================================
// GET /store/requests/:id
// Get a specific request
// ===========================================

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireCustomerId(req, res)
    if (!customerId) return

    const { id } = req.params

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    const request = requests[0]

    // Ensure the customer owns this request
    if (request.requester_id !== customerId) {
      res.status(403).json({ message: "Access denied" })
      return
    }

    res.json({ request })
  } catch (error) {
    throw error
  }
}

// ===========================================
// DELETE /store/requests/:id
// Cancel a request (customer action)
// ===========================================

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  try {
    const customerId = requireCustomerId(req, res)
    if (!customerId) return

    const { id } = req.params

    const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)

    const requests = await requestService.listRequests({ id })

    if (requests.length === 0) {
      res.status(404).json({ message: "Request not found" })
      return
    }

    const request = requests[0]

    // Ensure the customer owns this request
    if (request.requester_id !== customerId) {
      res.status(403).json({ message: "Access denied" })
      return
    }

    await requestService.cancelRequest(id)

    res.json({ message: "Request cancelled successfully" })
  } catch (error) {
    throw error
  }
}
