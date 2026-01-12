import { Module } from "@medusajs/framework/utils"
import CmsBlueprintService from "./service"

export const CMS_BLUEPRINT_MODULE = "cms_blueprint"

export type CmsBlueprintServiceType = InstanceType<typeof CmsBlueprintService>

export default Module(CMS_BLUEPRINT_MODULE, {
  service: CmsBlueprintService,
})
