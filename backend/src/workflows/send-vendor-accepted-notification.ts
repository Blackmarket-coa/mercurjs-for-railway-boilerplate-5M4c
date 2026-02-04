import {
  createStep,
  StepResponse,
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { 
  INotificationModuleService,
} from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { appendPath } from "../shared/url"

export type SendVendorAcceptedNotificationInput = {
  seller_id: string
  seller_name: string
  member_email: string
  member_name: string
  vendor_panel_url?: string
  onboarding_url?: string
  login_url?: string
}

/**
 * Step: Send Vendor Accepted Notification
 * 
 * Sends an email notification to a vendor when their account is approved/verified.
 */
export const sendVendorAcceptedNotificationStep = createStep(
  "send-vendor-accepted-notification",
  async (input: SendVendorAcceptedNotificationInput, { container }) => {
    const notificationModuleService: INotificationModuleService = container
      .resolve(Modules.NOTIFICATION)

    const vendorPanelUrl = input.vendor_panel_url ||
      process.env.VENDOR_PANEL_URL ||
      ""
    const onboardingUrl = input.onboarding_url ||
      (vendorPanelUrl ? appendPath(vendorPanelUrl, "/onboarding") : "")
    const loginUrl = input.login_url ||
      (vendorPanelUrl ? appendPath(vendorPanelUrl, "/login") : "")

    const notification = await notificationModuleService.createNotifications({
      to: input.member_email,
      template: "vendor-accepted",
      channel: "email",
      data: {
        seller_name: input.seller_name,
        member_name: input.member_name,
        vendor_panel_url: vendorPanelUrl,
        onboarding_url: onboardingUrl || undefined,
        login_url: loginUrl || undefined,
      }
    })

    return new StepResponse(notification)
  }
)

/**
 * Workflow: Send Vendor Accepted Notification
 * 
 * Sends an email to a vendor when their account has been accepted/verified.
 */
export const sendVendorAcceptedNotificationWorkflow = createWorkflow(
  "send-vendor-accepted-notification",
  (input: SendVendorAcceptedNotificationInput) => {
    const notification = sendVendorAcceptedNotificationStep(input)
    
    return new WorkflowResponse({
      notification,
    })
  }
)

export default sendVendorAcceptedNotificationWorkflow
