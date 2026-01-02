import { Module } from "@medusajs/framework/utils"
import VendorVerificationService from "./service"

export const VENDOR_VERIFICATION_MODULE = "vendor_verification"

export default Module(VENDOR_VERIFICATION_MODULE, {
  service: VendorVerificationService,
})
