import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

/**
 * POST /admin/sellers/invite
 *
 * Invite a seller by email
 */
export const POST = async (
  req: MedusaRequest<{
    email: string
    registration_url?: string
  }>,
  res: MedusaResponse
) => {
  const { email, registration_url } = req.body

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
    })
  }

  try {
    const notificationModule: INotificationModuleService = req.scope.resolve(
      Modules.NOTIFICATION
    )

    // Send invitation email
    await notificationModule.createNotifications({
      to: email,
      channel: "email",
      template: "seller-invitation",
      data: {
        registration_url: registration_url || process.env.VENDOR_PANEL_URL || "http://localhost:3000/vendor/register",
        email,
      },
    })

    return res.json({
      message: "Invitation sent successfully",
      email,
    })
  } catch (error) {
    console.error("Failed to send seller invitation:", error)
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Failed to send invitation",
    })
  }
}
