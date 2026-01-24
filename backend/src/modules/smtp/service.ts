import {
  AbstractNotificationProviderService,
  MedusaError
} from "@medusajs/framework/utils"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
  Logger
} from "@medusajs/framework/types"
import * as nodemailer from "nodemailer"
import { Transporter } from "nodemailer"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { orderPlacedEmail } from "../resend/emails/order-placed"
import { userInvitedEmail } from "../resend/emails/user-invited"
import { passwordResetEmail } from "../resend/emails/password-reset"

enum Templates {
  ORDER_PLACED = "order-placed",
  USER_INVITED = "user-invited",
  PASSWORD_RESET = "password-reset",
}

const templates: {[key in Templates]?: (props: unknown) => React.ReactNode} = {
  [Templates.ORDER_PLACED]: orderPlacedEmail,
  [Templates.USER_INVITED]: userInvitedEmail,
  [Templates.PASSWORD_RESET]: passwordResetEmail
}

type SMTPOptions = {
  host: string
  port: number
  secure?: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
  html_templates?: Record<string, {
    subject?: string
    content: string
  }>
}

type InjectedDependencies = {
  logger: Logger
}

class SMTPNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-smtp"
  private transporter: Transporter
  private options: SMTPOptions
  private logger: Logger

  constructor(
    { logger }: InjectedDependencies,
    options: SMTPOptions
  ) {
    super()

    // Create Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure ?? (options.port === 465), // true for 465, false for other ports
      auth: {
        user: options.auth.user,
        pass: options.auth.pass,
      },
    })

    this.options = options
    this.logger = logger

    // Verify connection on startup
    this.verifyConnection()
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify()
      this.logger.info("SMTP connection verified successfully")
    } catch (error) {
      this.logger.error("SMTP connection verification failed:", error)
    }
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.host) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `host` is required in the SMTP provider's options."
      )
    }
    if (!options.port) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `port` is required in the SMTP provider's options."
      )
    }
    if (!options.auth?.user) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `auth.user` is required in the SMTP provider's options."
      )
    }
    if (!options.auth?.pass) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `auth.pass` is required in the SMTP provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the SMTP provider's options."
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

    let html: string

    if (typeof template === "string") {
      html = template
    } else {
      // Render React component to HTML string
      const reactElement = createElement(template as any, notification.data)
      html = renderToStaticMarkup(reactElement)
    }

    const mailOptions = {
      from: this.options.from,
      to: notification.to,
      subject: this.getTemplateSubject(notification.template as Templates),
      html: html,
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)

      this.logger.info(`Email sent successfully to ${notification.to} (ID: ${info.messageId})`)

      return { id: info.messageId }
    } catch (error) {
      this.logger.error(`Failed to send email to ${notification.to}:`, error)

      // Provide helpful error messages
      if (error.message && error.message.includes("Invalid login")) {
        this.logger.error(
          `⚠️  SMTP AUTHENTICATION FAILED: Check your SMTP username and password. ` +
          `If using Gmail, you need an "App Password" instead of your regular password.`
        )
      }

      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email: ${error?.message || 'unknown error'}`
      )
    }
  }
}

export default SMTPNotificationProviderService
