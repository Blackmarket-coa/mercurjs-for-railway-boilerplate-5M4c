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
  async createRequest(input: {
    type: string
    data: Record<string, unknown>
    submitter_id?: string
    requester_id?: string
    reviewer_note?: string
  }) {
    // Support both submitter_id and requester_id for backwards compatibility
    const submitterId = input.submitter_id || input.requester_id

    if (!submitterId) {
      throw new Error("submitter_id or requester_id is required")
    }

    const [request] = await this.createRequests([{
      type: input.type,
      data: input.data,
      submitter_id: submitterId,
      requester_id: input.requester_id,
      reviewer_note: input.reviewer_note,
      status: RequestStatus.PENDING,
    }])

    return request
  }

  /**
   * Accept a request (update status to ACCEPTED)
   */
  async acceptRequest(id: string) {
    const request = await this.updateRequests(
      { id },
      { status: RequestStatus.ACCEPTED }
    )
    return request
  }

  /**
   * Reject a request (update status to REJECTED)
   */
  async rejectRequest(id: string) {
    const request = await this.updateRequests(
      { id },
      { status: RequestStatus.REJECTED }
    )
    return request
  }

  /**
   * Cancel a request (update status to CANCELLED)
   */
  async cancelRequest(id: string) {
    const request = await this.updateRequests(
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
