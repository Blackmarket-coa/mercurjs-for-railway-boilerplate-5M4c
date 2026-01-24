import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { requireAdminId } from "../../../shared/auth-helpers"
import { getRocketChatService } from "../../../shared/rocketchat-service"

/**
 * GET /admin/rocketchat
 * Returns Rocket.Chat configuration and login token for the admin panel
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

  // Get authenticated admin ID
  const adminId = requireAdminId(req, res)
  if (!adminId) return

  try {
    // Get admin user information
    const userModule = req.scope.resolve(Modules.USER)
    const admin = await userModule.retrieveUser(adminId)

    if (!admin || !admin.email) {
      res.status(404).json({
        message: "Admin user not found"
      })
      return
    }

    const username = admin.email.split("@")[0]

    // Get RocketChat service and create login token
    const rocketchatService = getRocketChatService()
    let loginToken = null

    if (rocketchatService) {
      try {
        loginToken = await rocketchatService.createUserToken(username)
        console.log(`[RocketChat] Created login token for admin: ${username}`)
      } catch (error: any) {
        console.error(`[RocketChat] Failed to create login token:`, error.message)
        // Don't fail the entire request, just don't provide auto-login
      }
    }

    const response: any = {
      configured: true,
      url: rocketchatUrl,
      iframe_url: `${rocketchatUrl}/channel/general`,
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
    console.error("[GET /admin/rocketchat] Error:", error)
    res.status(500).json({
      message: error.message || "Failed to retrieve RocketChat configuration"
    })
  }
}
