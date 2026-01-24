import {
  ModuleProvider,
  Modules
} from "@medusajs/framework/utils"
import SMTPNotificationProviderService from "./service"

export default ModuleProvider(Modules.NOTIFICATION, {
  services: [SMTPNotificationProviderService],
})
