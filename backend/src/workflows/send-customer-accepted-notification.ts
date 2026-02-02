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

export type SendCustomerAcceptedNotificationInput = {
  customer_email: string
  customer_name?: string
  storefront_url?: string
  login_url?: string
}

/**
 * Step: Send Customer Accepted Notification
 *
 * Sends an email notification to a customer when their account is approved.
 */
export const sendCustomerAcceptedNotificationStep = createStep(
  "send-customer-accepted-notification",
  async (input: SendCustomerAcceptedNotificationInput, { container }) => {
    const notificationModuleService: INotificationModuleService = container
      .resolve(Modules.NOTIFICATION)

    const storefrontUrl = input.storefront_url ||
      process.env.STOREFRONT_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      ""
    const loginUrl = input.login_url ||
      (storefrontUrl ? `${storefrontUrl}/account` : "")

    const notification = await notificationModuleService.createNotifications({
      to: input.customer_email,
      template: "customer-accepted",
      channel: "email",
      data: {
        customer_name: input.customer_name,
        storefront_url: storefrontUrl || undefined,
        login_url: loginUrl || undefined,
      },
    })

    return new StepResponse(notification)
  }
)

/**
 * Workflow: Send Customer Accepted Notification
 *
 * Sends an email to a customer when their account has been accepted.
 */
export const sendCustomerAcceptedNotificationWorkflow = createWorkflow(
  "send-customer-accepted-notification",
  (input: SendCustomerAcceptedNotificationInput) => {
    const notification = sendCustomerAcceptedNotificationStep(input)

    return new WorkflowResponse({
      notification,
    })
  }
)

export default sendCustomerAcceptedNotificationWorkflow
