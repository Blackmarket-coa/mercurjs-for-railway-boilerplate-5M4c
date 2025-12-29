import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

/**
 * GET /admin/rocketchat
 * Returns Rocket.Chat configuration for the admin panel
 */
export async function GET(
  req: MedusaRequest,
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

  res.json({
    configured: true,
    url: rocketchatUrl,
    iframe_url: `${rocketchatUrl}/channel/general`,
  })
}
