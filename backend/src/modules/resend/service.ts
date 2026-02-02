import { 
  AbstractNotificationProviderService, 
  MedusaError
} from "@medusajs/framework/utils"
import { 
  ProviderSendNotificationDTO, 
  ProviderSendNotificationResultsDTO,
  Logger
} from "@medusajs/framework/types";
import { 
  CreateEmailOptions, 
  Resend
} from "resend";
import { orderPlacedEmail } from "./emails/order-placed";
import { userInvitedEmail } from "./emails/user-invited";
import { passwordResetEmail } from "./emails/password-reset";
import { vendorAcceptedEmail } from "./emails/vendor-accepted";
import { customerAcceptedEmail } from "./emails/customer-accepted";

enum Templates {
  ORDER_PLACED = "order-placed",
  USER_INVITED = "user-invited",
  PASSWORD_RESET = "password-reset",
  VENDOR_ACCEPTED = "vendor-accepted",
  CUSTOMER_ACCEPTED = "customer-accepted",
}

const templates: {[key in Templates]?: (props: unknown) => React.ReactNode} = {
  [Templates.ORDER_PLACED]: orderPlacedEmail,
  [Templates.USER_INVITED]: userInvitedEmail,
  [Templates.PASSWORD_RESET]: passwordResetEmail,
  [Templates.VENDOR_ACCEPTED]: vendorAcceptedEmail,
  [Templates.CUSTOMER_ACCEPTED]: customerAcceptedEmail,
}

type ResendOptions = {
  api_key: string
  from: string
  html_templates?: Record<string, {
    subject?: string
    content: string
  }>
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"
  private resendClient: Resend
  private options: ResendOptions
  private logger: Logger

  constructor(
    { logger }: InjectedDependencies, 
    options: ResendOptions
  ) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options."
      )
    }
  }


  getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content
    }
    const allowedTemplates = Object.keys(templates)

    if (!allowedTemplates.includes(template)) {
      return null
    }

    return templates[template]
  }

  getTemplateSubject(template: Templates) {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject
    }
    switch(template) {
      case Templates.ORDER_PLACED:
        return "Order Confirmation"
      case Templates.USER_INVITED:
        return "You're Invited!"
      case Templates.PASSWORD_RESET:
        return "Reset Your Password"
      case Templates.VENDOR_ACCEPTED:
        return "Your vendor account is approved"
      case Templates.CUSTOMER_ACCEPTED:
        return "Your account has been approved"
      default:
        return "New Email"
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates)

    if (!template) {
      this.logger.error(`Couldn't find an email template for ${notification.template}. The valid options are ${Object.values(Templates)}`)
      return {}
    }

    const commonOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
    }

    let emailOptions: CreateEmailOptions
    if (typeof template === "string") {
      emailOptions = {
        ...commonOptions,
        html: template,
      }
    } else {
      emailOptions = {
        ...commonOptions,
        react: template(notification.data),
      }
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions)

    if (error || !data) {
      if (error) {
        this.logger.error(`Failed to send email to ${notification.to}:`, error)
        // Log specific error details for common issues
        if (error.message && error.message.includes("verify a domain")) {
          this.logger.error(
            `⚠️  RESEND DOMAIN NOT VERIFIED: You must verify your domain at resend.com/domains ` +
            `or use a verified domain in the RESEND_FROM_EMAIL environment variable.`
          )
        }
      } else {
        this.logger.error(`Failed to send email to ${notification.to}: unknown error`)
      }
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email: ${error?.message || 'unknown error'}`
      )
    }

    this.logger.info(`Email sent successfully to ${notification.to} (ID: ${data.id})`)
    return { id: data.id }
  }
}

export default ResendNotificationProviderService
