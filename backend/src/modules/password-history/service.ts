import { MedusaService } from "@medusajs/framework/utils"
import { PasswordHistoryEntry } from "./models"

class PasswordHistoryService extends MedusaService({
  PasswordHistoryEntry,
}) {}

export default PasswordHistoryService
