import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { getRocketChatService } from "../../../shared/rocketchat-service"

/**
 * GET /store/rocketchat
 * Returns Rocket.Chat configuration and login token for the authenticated customer
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const rocketchatUrl = process.env.ROCKETCHAT_URL

  if (!rocketchatUrl) {
    res.status(200).json({
      configured: false,
      message: "Rocket.Chat is not configured"
    })
    return
  }

  // Get authenticated customer ID from auth context
  const customerId = req.auth_context?.actor_id

  if (!customerId) {
    res.status(401).json({
      message: "Authentication required"
    })
    return
  }

  try {
    // Get customer information using query graph
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const { data: [customer] } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: {
        id: customerId,
      },
    })

    if (!customer || !customer.email) {
      res.status(404).json({
        message: "Customer information not found"
      })
      return
    }

    // Generate username from email or name
    const username = customer.email.split("@")[0]

    // Get RocketChat service and create login token
    const rocketchatService = getRocketChatService()
    let loginToken: string | null = null

    if (rocketchatService) {
      try {
        // Ensure customer has a RocketChat account (creates if doesn't exist)
        const displayName = customer.first_name && customer.last_name
          ? `${customer.first_name} ${customer.last_name}`
          : customer.email

        // Create RocketChat user if doesn't exist (using a random secure password)
        const crypto = await import("crypto")
        const tempPassword = crypto.randomBytes(32).toString("hex")

        await rocketchatService.createUser(
          displayName,
          customer.email,
          username,
          tempPassword
        )

        // Create login token for auto-login
        loginToken = await rocketchatService.createUserToken(username)
        console.log(`[RocketChat] Created login token for customer: ${username}`)
      } catch (error: any) {
        console.error(`[RocketChat] Failed to create login token:`, error.message)
        // Don't fail the entire request, just don't provide auto-login
      }
    }

    const response: any = {
      configured: true,
      url: rocketchatUrl,
      iframe_url: `${rocketchatUrl}/home`,
    }

    // Only include login credentials if we successfully generated a token
    if (loginToken) {
      response.login = {
        token: loginToken,
        username: username,
      }
    }

    res.json(response)
  } catch (error: any) {
    console.error("[GET /store/rocketchat] Error:", error)
    res.status(500).json({
      message: error.message || "Failed to retrieve RocketChat configuration"
    })
  }
}
