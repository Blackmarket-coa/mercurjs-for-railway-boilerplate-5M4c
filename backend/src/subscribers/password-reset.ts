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
    let resetUrl = ""
    const actorType = actor_type || "customer" // Default to customer if not specified

    switch (actorType) {
      case "customer":
        const storefrontUrl = process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_BASE_URL || ""
        resetUrl = `${storefrontUrl}/reset-password?token=${token}`
        break
      case "seller":
        const vendorUrl = process.env.VENDOR_URL || process.env.VENDOR_PANEL_URL || ""
        resetUrl = `${vendorUrl}/reset-password?token=${token}`
        break
      case "user":
        const adminUrl = process.env.ADMIN_URL || ""
        resetUrl = `${adminUrl}/reset-password?token=${token}`
        break
      case "driver":
        // Drivers use the same URL as sellers for now
        const driverUrl = process.env.VENDOR_URL || process.env.VENDOR_PANEL_URL || ""
        resetUrl = `${driverUrl}/reset-password?token=${token}`
        break
      default:
        console.warn(`Unknown actor_type: ${actorType}, defaulting to storefront`)
        const defaultUrl = process.env.STOREFRONT_URL || process.env.NEXT_PUBLIC_BASE_URL || ""
        resetUrl = `${defaultUrl}/reset-password?token=${token}`
    }

    if (!resetUrl) {
      console.error(`Could not construct reset URL for actor_type: ${actorType}. Please set environment variables.`)
      return
    }

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

    console.log(`[passwordReset subscriber] Password reset email sent to ${email}`)
  } catch (error) {
    console.error(`[passwordReset subscriber] Failed to send password reset email to ${email}:`, error)
    // Don't throw - notification failure shouldn't break the password reset flow
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
