import { MedusaRequest } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { REQUEST_MODULE } from "../modules/request"
import RequestModuleService from "../modules/request/service"
import { decodeAuthTokenFromAuthorization } from "./auth-helpers"

export interface RegistrationStatusResponse {
  status:
    | "approved"
    | "pending"
    | "rejected"
    | "cancelled"
    | "no_request"
    | "unauthenticated"
    | "unknown"
    | "error"
  seller_id?: string
  seller?: {
    id: string
    store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE" | null
  } | null
  store_status?: "ACTIVE" | "SUSPENDED" | "INACTIVE" | null
  request_id?: string
  message: string
  created_at?: string
  reviewer_note?: string
}

const getStoreStatus = (
  seller?: { store_status?: string | null } | null
): RegistrationStatusResponse["store_status"] => {
  const status = seller?.store_status ?? null
  if (status === "ACTIVE" || status === "SUSPENDED" || status === "INACTIVE") {
    return status
  }
  return null
}

const buildApprovedResponse = ({
  sellerId,
  seller,
  message,
  requestId,
}: {
  sellerId: string
  seller?: Record<string, unknown> | null
  message: string
  requestId?: string
}): RegistrationStatusResponse => ({
  status: "approved",
  seller_id: sellerId,
  seller: (seller as RegistrationStatusResponse["seller"]) ?? null,
  store_status: getStoreStatus(seller as { store_status?: string | null } | null),
  message,
  ...(requestId ? { request_id: requestId } : {}),
})

export const getSellerRegistrationStatus = async (
  req: MedusaRequest
): Promise<{ status: RegistrationStatusResponse; statusCode: number }> => {
  try {
    const decodedToken = decodeAuthTokenFromAuthorization(req.headers.authorization)
    if (!decodedToken && !(req as any).auth_context?.auth_identity_id) {
      return {
        statusCode: 401,
        status: {
          status: "unauthenticated",
          message: "Authentication required. Please provide a valid bearer token.",
        },
      }
    }

    const authModule = req.scope.resolve(Modules.AUTH)

    const authIdentityId =
      decodedToken?.authIdentityId ?? (req as any).auth_context?.auth_identity_id ?? null
    const sellerId = decodedToken?.sellerId ?? (req as any).auth_context?.actor_id ?? null

    if (sellerId) {
      const seller = await findSellerById(req, sellerId)
      if (seller) {
        return {
          statusCode: 200,
          status: buildApprovedResponse({
            sellerId,
            seller,
            message: "Your seller account is approved. You can access the vendor dashboard.",
          }),
        }
      }

      console.warn(
        "[GET /auth/seller/registration-status] Seller ID present in token but not found:",
        sellerId
      )
      return {
        statusCode: 404,
        status: {
          status: "error",
          seller_id: sellerId,
          seller: null,
          store_status: null,
          message: "Seller profile not found for this account. Please contact support.",
        },
      }
    }

    if (!authIdentityId) {
      return {
        statusCode: 401,
        status: {
          status: "unauthenticated",
          message: "Invalid or expired authentication. Please log in again.",
        },
      }
    }

    const authIdentity = await getAuthIdentity(authModule, authIdentityId)
    if (!authIdentity) {
      return {
        statusCode: 401,
        status: {
          status: "unauthenticated",
          message: "Invalid authentication. Please log in again.",
        },
      }
    }

    const appMetadata = authIdentity.app_metadata as Record<string, unknown> | undefined
    if (appMetadata?.seller_id) {
      const seller = await findSellerById(req, String(appMetadata.seller_id))
      if (!seller) {
        console.warn(
          "[GET /auth/seller/registration-status] Seller ID present in auth metadata but not found:",
          appMetadata.seller_id
        )
      } else {
        return {
          statusCode: 200,
          status: buildApprovedResponse({
            sellerId: String(appMetadata.seller_id),
            seller,
            message: "Your seller account is approved. You can access the vendor dashboard.",
          }),
        }
      }
    }

    return await checkRequests(req, authIdentityId, authModule)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("[GET /auth/seller/registration-status] Error:", message)
    return {
      statusCode: 500,
      status: {
        status: "error",
        message: "Failed to check registration status. Please try again later.",
      },
    }
  }
}

async function findSellerById(req: MedusaRequest, sellerId: string) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: sellers } = await query.graph({
    entity: "seller",
    fields: ["id", "store_status"],
    filters: { id: sellerId },
  })
  return sellers?.[0] ?? null
}

async function getAuthIdentity(authModule: any, authIdentityId: string) {
  const identities = await authModule.listAuthIdentities({ id: [authIdentityId] })
  if (!identities || identities.length === 0) return null
  console.log("[Auth identity] Found:", authIdentityId)
  return identities[0]
}

async function checkRequests(
  req: MedusaRequest,
  authIdentityId: string,
  authModule: any
): Promise<{ status: RegistrationStatusResponse; statusCode: number }> {
  const requestService = req.scope.resolve<RequestModuleService>(REQUEST_MODULE)
  const userRequests = await requestService.listRequests(
    {
      type: "seller",
      submitter_id: authIdentityId,
    },
    {
      order: { created_at: "DESC" },
    }
  )
  console.log(
    `[Requests] Found ${userRequests.length} requests for authIdentityId: ${authIdentityId}`
  )

  if (userRequests.length === 0) {
    return {
      statusCode: 200,
      status: {
        status: "no_request",
        message: "No registration request found. Please complete the registration process.",
      },
    }
  }

  const latestRequest = userRequests[0]

  console.log(
    `[Requests] Latest request status: ${latestRequest.status}, id: ${latestRequest.id}`
  )

  switch (latestRequest.status) {
    case "pending":
      return {
        statusCode: 200,
        status: {
          status: "pending",
          request_id: latestRequest.id,
          message:
            "Your registration request is pending approval. Please wait for an administrator to review your application.",
          created_at: latestRequest.created_at?.toISOString?.() ?? undefined,
        },
      }

    case "accepted":
      return await handleAcceptedRequest(req, latestRequest, authIdentityId, authModule)

    case "rejected":
      return {
        statusCode: 200,
        status: {
          status: "rejected",
          request_id: latestRequest.id,
          message:
            "Your registration request was not approved. Please contact support for more information.",
          reviewer_note: latestRequest.reviewer_note ?? undefined,
        },
      }

    case "cancelled":
      return {
        statusCode: 200,
        status: {
          status: "cancelled",
          request_id: latestRequest.id,
          message: "Your registration request was cancelled. You may submit a new registration.",
        },
      }

    default:
      return {
        statusCode: 200,
        status: {
          status: "unknown",
          request_id: latestRequest.id,
          message: "Unable to determine registration status. Please contact support.",
        },
      }
  }
}

async function handleAcceptedRequest(
  req: MedusaRequest,
  latestRequest: any,
  authIdentityId: string,
  authModule: any
): Promise<{ status: RegistrationStatusResponse; statusCode: number }> {
  try {
    const requestData = latestRequest.data as Record<string, any>
    const memberEmail = requestData?.member?.email

    if (memberEmail) {
      const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
      const memberResult = await pgConnection.raw(
        `
        SELECT seller_id
        FROM member
        WHERE email = ?
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [memberEmail]
      )
      const sellerId = memberResult.rows?.[0]?.seller_id

      if (sellerId) {
        const seller = await findSellerById(req, sellerId)
        if (seller) {
          console.log("[Accepted request] Found seller, updating auth_identity")
          await authModule.updateAuthIdentities([
            { id: authIdentityId, app_metadata: { seller_id: sellerId } },
          ])
          return {
            statusCode: 200,
            status: buildApprovedResponse({
              sellerId,
              seller,
              requestId: latestRequest.id,
              message: "Your seller account is approved. You can access the vendor dashboard.",
            }),
          }
        }
      }
    }

    return {
      statusCode: 200,
      status: {
        status: "approved",
        request_id: latestRequest.id,
        message:
          "Your registration has been approved. Please log out and log back in to access the dashboard.",
      },
    }
  } catch (err: any) {
    console.error("[Accepted request] Error:", err.message)
    return {
      statusCode: 200,
      status: {
        status: "approved",
        request_id: latestRequest.id,
        message:
          "Your registration has been approved. Please log out and log back in to access the dashboard.",
      },
    }
  }
}
