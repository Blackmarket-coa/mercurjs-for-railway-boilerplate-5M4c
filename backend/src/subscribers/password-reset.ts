import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

/**
 * Subscriber: Password Reset
 *
 * Automatically sends a password reset email when a user requests to reset their password.
 * Handles password reset for all actor types: customer, seller, user (admin), and driver.
 */
export default async function passwordResetHandler({
  event,
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const { entity_id: email, token, actor_type } = event.data

  if (!email || !token) {
    console.warn("Password reset event received without email or token")
    return
  }

  console.log(`[passwordReset subscriber] Processing password reset for ${actor_type}: ${email}`)

  try {
    const notificationModuleService = container.resolve("notification") as any

    // Build reset URL based on actor type
    const actorType = actor_type || "customer" // Default to customer if not specified
    let baseUrl = ""

    switch (actorType) {
      case "customer":
        baseUrl = process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_BASE_URL || ""
        break
      case "seller":
        baseUrl = process.env.VENDOR_URL || process.env.VENDOR_PANEL_URL || ""
        break
      case "user":
        baseUrl = process.env.ADMIN_URL || ""
        break
      case "driver":
        // Drivers use the same URL as sellers for now
        baseUrl = process.env.VENDOR_URL || process.env.VENDOR_PANEL_URL || ""
        break
      default:
        console.warn(`Unknown actor_type: ${actorType}, defaulting to storefront`)
        baseUrl = process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_BASE_URL || ""
    }

    // Validate that base URL is set and looks like a valid URL
    if (!baseUrl || !baseUrl.startsWith("http")) {
      console.error(`[passwordReset subscriber] Missing or invalid base URL for actor_type: ${actorType}. Please set the appropriate environment variable (VENDOR_URL, STOREFRONT_URL, or ADMIN_URL).`)
      return
    }

    const resetUrl = `${baseUrl}/reset-password?token=${token}`

    // Send notification using the password-reset template
    await notificationModuleService.createNotifications({
      to: email,
      channel: "email",
      template: "password-reset",
      data: {
        reset_url: resetUrl,
        email: email,
      },
    })

    console.log(`[passwordReset subscriber] Password reset email sent successfully to ${email}`)
  } catch (error) {
    console.error(`[passwordReset subscriber] Failed to send password reset email to ${email}:`, error)
    // Don't throw - notification failure shouldn't break the password reset flow
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
