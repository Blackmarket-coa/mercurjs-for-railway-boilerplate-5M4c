import { MedusaService } from "@medusajs/framework/utils"
import Request, { RequestStatus } from "./models/request"
import { validateRequestPayload } from "./validators"

class RequestModuleService extends MedusaService({
  Request,
}) {
  /**
   * Create a new request
   */
  async create(payload: any) {
    // Validate the payload
    const validatedPayload = validateRequestPayload(payload)
    
    // Create the request with validated payload
    const request = await this.Request.create({
      payload: validatedPayload,
      status: RequestStatus.PENDING,
    })
    
    return request
  }

  /**
   * List requests with optional filters
   */
  async list(filters: any = {}) {
    const requests = await this.Request.list(filters)
    return requests
  }

  /**
   * Update a request
   */
  async update(id: string, updateData: any) {
    const request = await this.Request.update(id, updateData)
    return request
  }

  /**
   * Get a request by ID
   */
  async getById(id: string) {
    const request = await this.Request.findById(id)
    return request
  }

  /**
   * Delete a request
   */
  async delete(id: string) {
    const request = await this.Request.delete(id)
    return request
  }

  /**
   * Accept a request
   */
  async accept(id: string) {
    const request = await this.Request.update(id, {
      status: RequestStatus.ACCEPTED
    })
    return request
  }

  /**
   * Reject a request
   */
  async reject(id: string) {
    const request = await this.Request.update(id, {
      status: RequestStatus.REJECTED
    })
    return request
  }

  /**
   * Get requests by user ID
   */
  async findByUserId(userId: string) {
    const requests = await this.Request.find({
      where: { userId }
    })
    return requests
  }

  /**
   * Get requests by status
   */
  async findByStatus(status: string) {
    const requests = await this.Request.find({
      where: { status }
    })
    return requests
  }

  /**
   * Get requests by type
   */
  async findByType(type: string) {
    const requests = await this.Request.find({
      where: { type }
    })
    return requests
  }

  /**
   * Get all requests with pagination
   */
  async listWithPagination(limit: number = 50, offset: number = 0) {
    const requests = await this.Request.find({
      skip: offset,
      take: limit
    })
    return requests
  }
}

export default RequestModuleService;

