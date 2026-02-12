import type { MedusaResponse } from "@medusajs/framework/http"
import jwt from "jsonwebtoken"
import { decodeAuthTokenWithError, extractSellerId } from "../auth-helpers"

const createResponseMock = (): MedusaResponse => {
  const response = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  }

  return response as unknown as MedusaResponse
}

describe("extractSellerId", () => {
  it("uses seller actor id when actor is seller", () => {
    const res = createResponseMock()

    const result = extractSellerId(
      {
        auth_context: {
          actor_id: "sel_123",
          app_metadata: { seller_id: "sel_meta" },
        },
      },
      res
    )

    expect(result).toEqual({ success: true, id: "sel_123" })
    expect((res.status as jest.Mock)).not.toHaveBeenCalled()
  })

  it("falls back to seller id from metadata", () => {
    const res = createResponseMock()

    const result = extractSellerId(
      {
        auth_context: {
          actor_id: "user_123",
          app_metadata: { seller_id: "mem_123" },
        },
      },
      res
    )

    expect(result).toEqual({ success: true, id: "mem_123" })
  })

  it("rejects non-seller actor id without seller metadata", () => {
    const res = createResponseMock()

    const result = extractSellerId(
      {
        auth_context: {
          actor_id: "user_123",
        },
      },
      res
    )

    expect(result).toEqual({ success: false, error: "Unauthorized", status: 401 })
    expect((res.status as jest.Mock)).toHaveBeenCalledWith(401)
  })
})

describe("decodeAuthTokenWithError", () => {
  const originalSecret = process.env.JWT_SECRET

  beforeEach(() => {
    process.env.JWT_SECRET = "01234567890123456789012345678901"
  })

  afterAll(() => {
    process.env.JWT_SECRET = originalSecret
  })

  it("prefers explicit seller_id claim", () => {
    const token = jwt.sign(
      {
        actor_id: "user_123",
        actor_type: "user",
        seller_id: "sel_abc",
      },
      process.env.JWT_SECRET!
    )

    const result = decodeAuthTokenWithError(token)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.token.sellerId).toBe("sel_abc")
    }
  })

  it("derives seller id from actor id only for seller actors", () => {
    const token = jwt.sign(
      {
        actor_id: "sel_derived",
        actor_type: "seller",
      },
      process.env.JWT_SECRET!
    )

    const result = decodeAuthTokenWithError(token)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.token.sellerId).toBe("sel_derived")
    }
  })
})
