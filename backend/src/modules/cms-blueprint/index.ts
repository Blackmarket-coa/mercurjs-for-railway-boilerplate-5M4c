import { Module } from "@medusajs/framework/utils"
import CmsBlueprintService from "./service"

export const CMS_BLUEPRINT_MODULE = "cms-blueprint"

export default Module(CMS_BLUEPRINT_MODULE, {
  service: CmsBlueprintService,
})
