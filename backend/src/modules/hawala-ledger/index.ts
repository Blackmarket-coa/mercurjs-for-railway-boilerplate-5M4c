import { Module } from "@medusajs/framework/utils"
import HawalaLedgerModuleService from "./service"

export const HAWALA_LEDGER_MODULE = "hawalaLedger"

export default Module(HAWALA_LEDGER_MODULE, {
  service: HawalaLedgerModuleService,
})
