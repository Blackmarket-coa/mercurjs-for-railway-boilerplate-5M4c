import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SELLER_MODULE } from "@mercurjs/b2c-core/modules/seller"
import { requireSellerId } from "../../../shared/auth-helpers"
import { getRocketChatService } from "../../../shared/rocketchat-service"

/**
 * GET /vendor/rocketchat
 * Returns Rocket.Chat configuration and login token for the authenticated vendor
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

  // Get authenticated seller ID
  const sellerId = await requireSellerId(req, res)
  if (!sellerId) return

  try {
    // Get seller information from MercurJS
    const sellerService = req.scope.resolve(SELLER_MODULE)
    const seller = await sellerService.retrieveSeller(sellerId, {
      relations: ["members"],
    })

    if (!seller || !seller.members || seller.members.length === 0) {
      res.status(404).json({
        message: "Seller information not found"
      })
      return
    }

    // Get the primary member (first member)
    const member = seller.members[0]

    if (!member.email) {
      res.status(404).json({
        message: "Seller member email not found"
      })
      return
    }

    const username = seller.handle || member.email.split("@")[0]

    // Get RocketChat service and create login token
    const rocketchatService = getRocketChatService()
    let loginData: { userId: string; authToken: string } | null = null

    if (rocketchatService) {
      try {
        loginData = await rocketchatService.createUserToken(username)
        console.log(`[RocketChat] Created login token for vendor: ${username}`)
      } catch (error: any) {
        console.error(`[RocketChat] Failed to create login token:`, error.message)
        // Don't fail the entire request, just don't provide auto-login
      }
    }

    const channelName = `vendor-${sellerId}`
    const response: any = {
      configured: true,
      url: rocketchatUrl,
      iframe_url: `${rocketchatUrl}/channel/${channelName}`,
    }

    // Only include login credentials if we successfully generated a token
    if (loginData) {
      response.login = {
        token: loginData.authToken,
        userId: loginData.userId,
        username: username,
      }
    }

    res.json(response)
  } catch (error: any) {
    console.error("[GET /vendor/rocketchat] Error:", error)
    res.status(500).json({
      message: error.message || "Failed to retrieve RocketChat configuration"
    })
  }
}
