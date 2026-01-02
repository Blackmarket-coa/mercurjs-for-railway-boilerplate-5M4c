import { Module } from "@medusajs/framework/utils"
import VendorVerificationService from "./service"

export const VENDOR_VERIFICATION_MODULE = "vendorVerification"

export default Module(VENDOR_VERIFICATION_MODULE, {
  service: VendorVerificationService,
})
