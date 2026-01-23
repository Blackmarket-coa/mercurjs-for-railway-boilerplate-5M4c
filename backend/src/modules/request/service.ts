import { MedusaService } from "@medusajs/framework/utils"
import Request, { RequestStatus } from "./models/request"

/**
 * RequestModuleService
 *
 * Provides CRUD operations for the Request module.
 * Extends MedusaService which provides:
 * - createRequests(data)
 * - listRequests(filters, config)
 * - updateRequests(selector, data)
 * - deleteRequests(ids)
 * - retrieveRequest(id, config)
 */
class RequestModuleService extends MedusaService({
  Request,
}) {
  /**
   * Create a single request (convenience wrapper)
   */
  async createRequest(data: {
    submitter_id?: string
    requester_id?: string
    provider_id?: string
    payload?: Record<string, unknown>
    notes?: string
  }) {
    // Support both submitter_id and requester_id for backwards compatibility
    const submitterId = data.submitter_id || data.requester_id

    const [request] = await this.createRequests([{
      submitter_id: submitterId,
      provider_id: data.provider_id,
      status: RequestStatus.PENDING,
      payload: data.payload || {},
      notes: data.notes,
    }])

    return request
  }

  /**
   * Accept a request (update status to ACCEPTED)
   */
  async acceptRequest(id: string) {
    const [request] = await this.updateRequests(
      { id },
      { status: RequestStatus.ACCEPTED }
    )
    return request
  }

  /**
   * Reject a request (update status to REJECTED)
   */
  async rejectRequest(id: string) {
    const [request] = await this.updateRequests(
      { id },
      { status: RequestStatus.REJECTED }
    )
    return request
  }

  /**
   * Cancel a request (update status to CANCELLED)
   */
  async cancelRequest(id: string) {
    const [request] = await this.updateRequests(
      { id },
      { status: RequestStatus.CANCELLED }
    )
    return request
  }

  /**
   * Get requests by requester/submitter ID
   */
  async getRequesterRequests(requesterId: string) {
    const requests = await this.listRequests({
      submitter_id: requesterId,
    })
    return requests
  }

  /**
   * Get requests by provider ID
   */
  async getProviderRequests(providerId: string) {
    const requests = await this.listRequests({
      provider_id: providerId,
    })
    return requests
  }

  /**
   * Get requests by status
   */
  async getRequestsByStatus(status: RequestStatus) {
    const requests = await this.listRequests({
      status,
    })
    return requests
  }
}

export default RequestModuleService
