import { Module } from "@medusajs/framework/utils"
import PasswordHistoryService from "./service"

export const PASSWORD_HISTORY_MODULE = "passwordHistory"

export default Module(PASSWORD_HISTORY_MODULE, {
  service: PasswordHistoryService,
})

export * from "./models"
